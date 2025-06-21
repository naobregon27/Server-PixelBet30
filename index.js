const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const RegistroMacleyn = require("./models/Registro");
const RegistroLuchito = require("./models/RegistroLuchito");
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(require("cors")());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Asegura que req.body funcione correctamente

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

    // 3. Evitar duplicados si el ID ya existe
    const existente = await RegistroMacleyn.findOne({ id });
    if (existente) {
      return res.status(409).json({ error: "Este ID ya fue registrado" });
    }

    // 4. Guardar en la base de datos
    const nuevoRegistro = new RegistroMacleyn({
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

    // Paso 2: Buscar el campo personalizado 'mensajeenviar'
    const campoMensaje = lead.custom_fields_values?.find(field =>
      field.field_name === "mensajeenviar"
    );
    const mensaje = campoMensaje?.values?.[0]?.value;

    console.log("📝 Mensaje guardado en el lead (mensajeenviar):", mensaje);

    // Paso 3: Extraer el ID si el mensaje incluye uno
    const idExtraido = mensaje?.match(/\d{13,}/)?.[0]; // extrae número de 13+ dígitos
    console.log("🧾 ID extraído del mensaje:", idExtraido);

    // Paso 4: Buscar en MongoDB si ese ID existe
    if (idExtraido) {

      let registro;

      if (kommoId === "cajaadmi01") {
        registro = await RegistroMacleyn.findOne({ id: idExtraido });
      } else if (kommoId === "luchito463") {
        registro = await RegistroLuchito.findOne({ id: idExtraido })
      }

      // Ejecutar pixel de Meta (API de Conversiones)
      if (registro) {
        console.log("✅ Registro encontrado:", registro);

        try {

          const PIXEL_ID = registro.pixel

          // 🧠 Disparar el Pixel de Meta
          !function (f, b, e, v, n, t, s) {
            if (f.fbq) return;
            n = f.fbq = function () {
              n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e); t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s)
          }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

          fbq('init', PIXEL_ID);
          fbq('track', 'PageView');

          const pixelResponse = await axios.post(
            `https://graph.facebook.com/v19.0/${registro.pixel}/events`,
            {
              data: [
                {
                  event_name: "Click",
                  event_time: Math.floor(Date.now() / 1000),
                  action_source: "website",
                  event_source_url: `https://${registro.subdominio}.${registro.dominio}`,
                  user_data: {
                    client_ip_address: registro.ip,
                    client_user_agent: req.headers["user-agent"],
                  },
                },
              ],
            },
            {
              headers: {
                Authorization: `Bearer ${registro.token}`,
                "Content-Type": "application/json",
              },
            }
          );



          console.log("📡 Pixel ejecutado con éxito:", pixelResponse.data);
        } catch (error) {
          console.error("❌ Error al ejecutar el pixel:", error.response?.data || error.message);
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