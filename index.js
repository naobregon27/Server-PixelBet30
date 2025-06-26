const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const RegistroMacleyn = require("./models/Registro");
const RegistroLuchito = require("./models/RegistroLuchito");
const axios = require('axios');
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(require("cors")());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Asegura que req.body funcione correctamente
app.use(cookieParser());

// Conexión a MongoDB con manejo de eventos
mongoose.connect("mongodb+srv://lauraahora4632025:hXqOPPuQ1INnrtkX@ahora4633.kcvqn5q.mongodb.net/")
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB Atlas');
  })
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
  });

// Eventos adicionales de conexión
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB conectado');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Error en la conexión de MongoDB:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 MongoDB desconectado');
});

const isValidIP = (ip) => {
  const regex =
    /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  return regex.test(ip);
};

app.post("/guardar", async (req, res) => {
  try {
    const { id, token, pixel, subdominio, dominio, ip, fbclid, mensaje } =
      req.body;

    const { kommoId } = req.query;

    // 1. Verificación de campos obligatorios
    if (!id || !token || !pixel || !subdominio || !dominio || !ip) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // 2. Validación de tipos y formatos
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "ID debe ser numérico" });
    }

    if (!isValidIP(ip)) {
      return res.status(400).json({ error: "IP no es válida" });
    }

    let existente;
    // 3. Evitar duplicados si el ID ya existe
    if (kommoId === "cajaadmi01") {
      existente = await RegistroMacleyn.findOne({ id });
    } else if (kommoId === "luchito4637") {
      existente = await RegistroLuchito.findOne({ id });
    }

    if (existente) {
      return res.status(409).json({ error: "Este ID ya fue registrado" });
    }

    let nuevoRegistro;

    if (kommoId === "cajaadmi01") {
      nuevoRegistro = new RegistroMacleyn({
        id,
        token,
        pixel,
        subdominio,
        dominio,
        ip,
        fbclid,
        mensaje,
      });

      await nuevoRegistro.save();
    } else if (kommoId === "luchito4637") {
      nuevoRegistro = new RegistroLuchito({
        id,
        token,
        pixel,
        subdominio,
        dominio,
        ip,
        fbclid,
        mensaje,
      });

      await nuevoRegistro.save();
    }

    res.status(201).json({ mensaje: "Datos guardados con éxito" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno al guardar los datos" });
  }
});

app.post("/verificacion", async (req, res) => {
  const body = req.body;
  const { kommoId, token } = req.query;

  console.log(JSON.stringify(body, null, 2), "← este es lo que devuelve el body");
  const leadId = req.body?.leads?.add?.[0]?.id;

  if (!leadId) {
    return res.status(400).send("Lead ID no encontrado");
  }

  const contacto = await obtenerContactoDesdeLead(leadId, kommoId, token);

  if (contacto) {
    console.log("🧾 ID del contacto:", contacto.id);

    const leadResponse = await axios.get(`https://${kommoId}.kommo.com/api/v4/leads/${leadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const lead = leadResponse.data;

    const campoMensaje = lead.custom_fields_values?.find(field =>
      field.field_name === "mensajeenviar"
    );
    const mensaje = campoMensaje?.values?.[0]?.value;

    console.log("📝 Mensaje guardado en el lead (mensajeenviar):", mensaje);

    const idExtraido = mensaje?.match(/\d{13,}/)?.[0];
    console.log("🧾 ID extraído del mensaje:", idExtraido);

    if (idExtraido) {
      let registro;

      if (kommoId === "cajaadmi01") {
        registro = await RegistroMacleyn.findOne({ id: idExtraido });
      } else if (kommoId === "luchito4637") {
        registro = await RegistroLuchito.findOne({ id: idExtraido });
      }

      if (registro) {
        console.log("✅ Registro encontrado:", registro);

        try {
          // Generar fbc, fbp y event_id
          const cookies = req.cookies;
          const fbclid = registro.fbclid;

          const fbc = cookies._fbc || (fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}` : null);
          const fbp = cookies._fbp || `fb.1.${Math.floor(Date.now() / 1000)}.${Math.floor(1000000000 + Math.random() * 9000000000)}`;

          // Asegúrate de que event_id sea único y no el ID del píxel
          const event_id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

          // URL con el parámetro access_token correctamente
          const pixelEndpointUrl = `https://graph.facebook.com/v18.0/${registro.pixel}/events?access_token=${registro.token}`;

          const eventData = {
            event_name: "Lead",
            event_id,
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            event_source_url: `https://${registro.subdominio}.${registro.dominio}`,
            user_data: {
              client_ip_address: registro.ip,
              client_user_agent: req.headers["user-agent"],
              em: registro.email ? require("crypto").createHash("sha256").update(registro.email).digest("hex") : undefined,
              fbc,
              fbp
            },
          };

          console.log("Datos del evento a enviar:", JSON.stringify(eventData, null, 2)); // Para depuración
          console.log("URL del Pixel:", pixelEndpointUrl); // Para depuración

          const pixelResponse = await axios.post(
            pixelEndpointUrl,
            {
              data: [eventData], // Envuelve el evento en un array 'data'
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log("📡 Pixel ejecutado con éxito:", pixelResponse.data);
        } catch (error) {
          console.error("❌ Error al ejecutar el pixel:", error.response?.data || error.message);
          if (error.response) {
            // La solicitud se hizo y el servidor respondió con un estado de error (ej. 4xx o 5xx)
            console.error("Estado del error:", error.response.status);
            console.error("Encabezados del error:", error.response.headers);
            console.error("Datos del error:", error.response.data);
          } else if (error.request) {
            // La solicitud se hizo pero no se recibió respuesta (ej. sin conexión a internet)
            console.error("No se recibió respuesta del servidor:", error.request);
          } else {
            // Algo más causó el error
            console.error("Error desconocido:", error.message);
          }
        }
      } else {
        console.log("❌ No se encontró un registro con ese ID");
      }
    } else {
      console.log("⚠️ No se pudo extraer un ID del mensaje");
    }
  }

  res.sendStatus(200);
});


async function obtenerContactoDesdeLead(leadId, kommoId, token) {
  const url = `https://${kommoId}.kommo.com/api/v4/leads/${leadId}?with=contacts`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const lead = response.data;
    const contacto = lead._embedded?.contacts?.[0]; // primer contacto vinculado

    if (!contacto) {
      console.log("⚠️ No se encontró ningún contacto asociado a este lead");
      return null;
    }

    console.log("✅ Contacto vinculado al lead:", contacto);
    return contacto;

  } catch (err) {
    console.error("❌ Error al obtener contacto desde lead:", err.response?.data || err.message);
    return null;
  }
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});