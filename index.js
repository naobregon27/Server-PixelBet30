const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const RegistroMacleyn = require("./models/Registro");
const RegistroLuchito = require("./models/RegistroLuchito");
const RegistroBetone = require("./models/RegistroBetone");
const RegistroBettwo = require("./models/RegistroBettwo");
const RegistroBetthree = require("./models/RegistroBetthree");
const RegistroBetFour = require("./models/RegistroBetFour");
const RegistroGanamosnet = require("./models/RegistroGanamosnet");
const RegistroCash365 = require("./models/RegistroCash365");
const Registromctitan = require("./models/Registromctitan");
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

// =====================================================================
// CAMBIO 1: Función auxiliar para actualizar campos en Kommo (REINCORPORADA)
// Se añadió antes de las rutas de Express para que sea globalmente accesible.
// =====================================================================
async function actualizarCampoLead(lead, kommoId, token, fieldName, fieldValue) {
  const url = `https://${kommoId}.kommo.com/api/v4/leads/${lead.id}`;

  try {
    const customFields = lead.custom_fields_values || [];
    let targetField = customFields.find(field => field.field_name === fieldName);

    if (targetField) {
      targetField.values = [{ value: fieldValue }];
    } else {
      // IMPORTANTE: Usa el ID del campo 'mensajeenviar' de tu Kommo para 'mctitan'
      targetField = {
        field_id: 1067428, // <-- ¡ASEGÚRATE DE QUE ESTE ID SEA EL CORRECTO PARA Mctitan!
        field_name: fieldName,
        values: [{ value: fieldValue }]
      };
      customFields.push(targetField);
    }

    const updateData = {
      custom_fields_values: customFields
    };

    const response = await axios.patch(url, updateData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`✅ Campo '${fieldName}' actualizado en el lead ${lead.id} en Kommo.`);
    return response.data;
  } catch (err) {
    console.error(`❌ Error al actualizar el campo '${fieldName}' en el lead ${lead.id}:`, err.response?.data || err.message);
    return null;
  }
}
// =====================================================================
// FIN CAMBIO 1
// =====================================================================


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
    } else if (kommoId === "blackpanther1") {
      existente = await RegistroBetone.findOne({ id });
    } else if (kommoId === "blackpanther2") {
      existente = await RegistroBettwo.findOne({ id });
    } else if (kommoId === "blackpanther3") {
      existente = await RegistroBetthree.findOne({ id });
    } else if (kommoId === "blackpanther4") {
      existente = await RegistroBetFour.findOne({ id });
    } else if (kommoId === "Ganamosnet") {
      existente = await RegistroGanamosnet.findOne({ id });
    } else if (kommoId === "Cash365") {
      existente = await RegistroCash365.findOne({ id });
    } else if (kommoId === "mctitan") {
      existente = await Registromctitan.findOne({ id });
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
    } else if (kommoId === "blackpanther1") {
      nuevoRegistro = new RegistroBetone({
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
    } else if (kommoId === "blackpanther2") {
      nuevoRegistro = new RegistroBettwo({
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
    } else if (kommoId === "blackpanther3") {
      nuevoRegistro = new RegistroBetthree({
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
    } else if (kommoId === "blackpanther4") {
      nuevoRegistro = new RegistroBetFour({
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
    } else if (kommoId === "Ganamosnet") {
      nuevoRegistro = new RegistroGanamosnet({
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
    } else if (kommoId === "Cash365") {
      nuevoRegistro = new RegistroCash365({
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
    } else if (kommoId === "mctitan") {
      nuevoRegistro = new Registromctitan({
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
  const leadId = req.body?.leads?.add?.[0]?.id || req.body?.leads?.update?.[0]?.id; // Incluye leads.update para webhooks de actualización

  if (!leadId) {
    return res.status(400).json({
      error: "Lead ID no encontrado",
      detalles: {
        tipo: 'lead_no_encontrado_inicial',
        mensaje: "No se encontró el ID del lead en la solicitud",
        timestamp: new Date()
      }
    });
  }

  if (kommoId === "mctitan") {
    // Se necesita obtener el lead y el contacto dentro de este bloque
    // para acceder a sus custom_fields_values y para la función actualizarCampoLead.
    let lead = null;
    let contacto = null;
    try {
      const leadResponse = await axios.get(`https://${kommoId}.kommo.com/api/v4/leads/${leadId}?with=contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      lead = leadResponse.data;
      contacto = lead._embedded?.contacts?.[0]; // Primer contacto vinculado
    } catch (error) {
      console.error("❌ Error al obtener el lead y contacto para mctitan:", error.response?.data || error.message);
      return res.status(500).json({
        error: "Error al obtener datos del lead en Kommo para mctitan",
        detalles: {
          tipo: 'kommo_lead_error_mctitan',
          mensaje: error.response?.data?.detail || error.message,
          timestamp: new Date()
        }
      });
    }

    // Obtener el mensaje que puede contener el ID
    let mensaje = await buscarMensaje(leadId, kommoId, token);

    if (mensaje) {
      console.log("✅ Mensaje final encontrado:", mensaje);
    } else {
      // Antes de devolver error, intenta leer del campo "mensajeenviar"
      // si `buscarMensaje` no encontró nada en las notas.
      const campoMensaje = lead.custom_fields_values?.find(field =>
        field.field_name === "mensajeenviar"
      );
      if (campoMensaje && campoMensaje.values?.[0]?.value) {
        mensaje = campoMensaje.values[0].value;
        console.log("📝 Mensaje obtenido del campo 'mensajeenviar' del lead para mctitan:", mensaje);
      } else {
        console.log("❌ No se encontró ningún mensaje en lead ni contacto para mctitan.");
        return res.status(404).json({
          error: "Mensaje de ID no encontrado para mctitan",
          detalles: {
            tipo: 'mensaje_id_no_encontrado_mctitan',
            mensaje: "No se pudo encontrar el mensaje que contiene el ID en el lead o notas para mctitan.",
            timestamp: new Date()
          }
        });
      }
    }

    // Extraer el ID del mensaje
    const idExtraido = mensaje?.match(/\d{13,}/)?.[0];
    console.log("🧾 ID extraído del mensaje para mctitan:", idExtraido);

    if (idExtraido) {
      let Modelo = Registromctitan; // Para mctitan, el modelo siempre es Registromctitan

      try {
        let registro = await Modelo.findOne({ id: idExtraido });

        // Si el registro no existe en tu DB, créalo
        if (!registro) {
          console.log("➕ No se encontró un registro existente en DB para mctitan, creando uno nuevo.");
          registro = new Modelo({
            id: idExtraido,
            token: token,
            pixel: "TU_PIXEL_DEFAULT_PARA_MCTITAN", // <-- Define cómo obtienes el pixel para registros nuevos de mctitan
            subdominio: kommoId,
            dominio: "kommo.com",
            ip: req.ip || 'desconocida',
            fbclid: lead.custom_fields_values?.find(field => field.field_name === "fbclid")?.values?.[0]?.value || null,
            mensaje: mensaje,
          });
          await registro.save();
          console.log("✅ Nuevo registro creado en MongoDB para mctitan.");
        }

        if (registro.isVerified) {
          console.log("Registro ya pixeleado para mctitan, saltando verificación.");
          return res.status(200).json({
            mensaje: "Registro ya verificado para mctitan",
            estado: "pre-verificado"
          });
        }

        // >>> LÓGICA REINCORPORADA: Actualizar campo 'mensajeenviar' en Kommo <<<
        // Se asegura que el campo 'mensajeenviar' en Kommo contenga el ID extraído.
        // Solo lo actualiza si el campo no existe o si su valor actual es diferente.
        const currentCampoMensaje = lead.custom_fields_values?.find(field =>
          field.field_name === "mensajeenviar"
        );
        if (!currentCampoMensaje || currentCampoMensaje.values?.[0]?.value !== idExtraido) {
          console.log(`🔄 [${kommoId}] Actualizando campo 'mensajeenviar' en Kommo con el ID extraído: ${idExtraido}.`);
          await actualizarCampoLead(lead, kommoId, token, "mensajeenviar", idExtraido);
        } else {
          console.log(`✅ [${kommoId}] Campo 'mensajeenviar' en Kommo ya contiene el ID correcto.`);
        }
        // >>> FIN DE LÓGICA REINCORPORADA <<<

        // Obtener el número de WhatsApp del contacto
        const whatsappNumber = contacto.custom_fields_values?.find(field =>
          field.field_code === "PHONE" || field.field_name?.toLowerCase().includes("whatsapp")
        )?.values?.[0]?.value;

        if (whatsappNumber) {
          registro.whatsappNumber = whatsappNumber;
          console.log("📱 Número de WhatsApp guardado en DB para mctitan:", whatsappNumber);
        }

        // Intentamos verificar el registro (ejecutar el pixel de Facebook)
        try {
          const cookies = req.cookies;
          const fbclid = registro.fbclid;

          const fbc = cookies._fbc || (fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}` : null);
          const fbp = cookies._fbp || `fb.1.${Math.floor(Date.now() / 1000)}.${Math.floor(1000000000 + Math.random() * 9000000000)}`;
          const event_id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

          registro.isVerified = true;
          registro.verificationStatus = 'verificado';
          await registro.save();

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

          console.log("Datos del evento a enviar para mctitan:", JSON.stringify(eventData, null, 2));
          console.log("URL del Pixel para mctitan:", pixelEndpointUrl);

          const pixelResponse = await axios.post(
            pixelEndpointUrl,
            {
              data: [eventData],
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log("📡 Pixel ejecutado con éxito para mctitan:", pixelResponse.data);
          return res.status(200).json({
            mensaje: "Verificación completada exitosamente para mctitan",
            estado: "verificado"
          });

        } catch (error) {
          console.error("❌ Error al ejecutar el pixel para mctitan:", error.response?.data || error.message);

          registro.isVerified = false;
          registro.verificationStatus = 'fallido';
          registro.verificationError = {
            tipo: 'pixel_error_mctitan',
            mensaje: error.response?.data?.error?.message || error.message,
            timestamp: new Date()
          };
          await registro.save();

          if (error.response) {
            console.error("Estado del error para mctitan:", error.response.status);
            console.error("Encabezados del error para mctitan:", error.response.headers);
            console.error("Datos del error para mctitan:", error.response.data);
          } else if (error.request) {
            console.error("No se recibió respuesta del servidor para mctitan:", error.request);
          } else {
            console.error("Error desconocido para mctitan:", error.message);
          }

          return res.status(500).json({
            error: "Error al ejecutar el pixel para mctitan",
            detalles: registro.verificationError
          });
        }
      } catch (error) {
        console.error("Error al buscar o actualizar el registro en DB para mctitan:", error);
        return res.status(500).json({
          error: "Error interno al procesar el registro para mctitan",
          detalles: {
            tipo: 'error_interno_db_mctitan',
            mensaje: error.message,
            timestamp: new Date()
          }
        });
      }
    } else {
      console.log("⚠️ No se pudo extraer un ID del mensaje para procesar en mctitan.");
      return res.status(400).json({
        error: "ID no encontrado en mensaje para mctitan",
        detalles: {
          tipo: 'id_no_encontrado_en_mensaje_mctitan',
          mensaje: "No se pudo extraer un ID válido del mensaje recibido o de las notas para mctitan.",
          timestamp: new Date()
        }
      });
    }
  }
  // =====================================================================
  // CAMBIO 3: Bloque para otros kommoIds (NO mctitan).
  // Este bloque se ejecuta si el kommoId NO es "mctitan".
  // =====================================================================
  console.log("ℹ️ Solicitud de verificación recibida para un Kommo ID diferente a mctitan o con Lead ID no encontrado al inicio.");
  return res.status(400).json({
    error: "Solicitud no procesada para este Kommo ID o Lead ID ausente",
    detalles: {
      tipo: 'kommo_id_no_procesado_o_lead_id_ausente',
      mensaje: "La lógica de procesamiento para este Kommo ID no está implementada en esta sección o el Lead ID no se encontró en la solicitud.",
      timestamp: new Date()
    }
  });
  // =====================================================================
  // FIN CAMBIO 3
  // =====================================================================
});

// =====================================================================
// CAMBIO 4: Las funciones `buscarMensaje` y `obtenerContactoDesdeLead`
// Estas funciones se mantuvieron intactas, ya que son funciones auxiliares.
// =====================================================================
async function buscarMensaje(leadId, kommoId, token, reintentos = 3) {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const buscarNotas = async (id, tipoEntidad) => {
    for (let intento = 1; intento <= reintentos; intento++) {
      try {
        const response = await axios.get(
          `https://${kommoId}.kommo.com/api/v4/notes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              entity_id: id,
              entity_type: tipoEntidad,
            },
          }
        );

        const notas = response.data?._embedded?.notes || [];
        const notaMensaje = notas.find((n) => n.note_type === "message");
        if (notaMensaje) {
          console.log(`📨 Mensaje encontrado en ${tipoEntidad}:`, notaMensaje.params?.text);
          return notaMensaje.params?.text;
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(`❌ Error consultando notas de ${tipoEntidad}:`, err.response?.data || err.message);
          break;
        } else {
          console.log(`🔄 [${tipoEntidad}] Intento ${intento}/${reintentos}: sin notas aún...`);
        }
      }

      await delay(1500); // espera 1.5 segundos antes de reintentar
    }

    return null;
  };

  // Paso 1: buscar en el lead
  const mensajeDelLead = await buscarNotas(leadId, "leads");
  if (mensajeDelLead) return mensajeDelLead;

  // Paso 2: obtener contacto vinculado
  const contacto = await obtenerContactoDesdeLead(leadId, kommoId, token);
  if (!contacto?.id) {
    console.log("⚠️ No se encontró contacto vinculado.");
    return null;
  }

  // Paso 3: buscar en el contacto
  const mensajeDelContacto = await buscarNotas(contacto.id, "contacts");
  return mensajeDelContacto || null;
}

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
// =====================================================================
// FIN CAMBIO 4
// =====================================================================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});