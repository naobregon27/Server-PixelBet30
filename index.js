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
// Función auxiliar `actualizarCampoLead` (Mantenida exactamente como en tu código)
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

// =====================================================================
// app.post("/verificacion") con logs de depuración añadidos
// =====================================================================
app.post("/verificacion", async (req, res) => {
  const body = req.body;
  const { kommoId, token } = req.query;

  console.log(JSON.stringify(body, null, 2), "← este es lo que devuelve el body");
  const leadId = req.body?.leads?.add?.[0]?.id || req.body?.leads?.update?.[0]?.id;

  if (!leadId) {
    return res.status(400).json({
      error: "Lead ID no encontrado",
      detalles: {
        tipo: 'lead_no_encontrado_en_webhook',
        mensaje: "No se encontró el ID del lead en la solicitud de webhook.",
        timestamp: new Date()
      }
    });
  }

  let contacto = null;
  let lead = null;

  try {
    const leadResponse = await axios.get(`https://${kommoId}.kommo.com/api/v4/leads/${leadId}?with=contacts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    lead = leadResponse.data;
    contacto = lead._embedded?.contacts?.[0];

    // --- LOG DE DEPURACIÓN 1: Inspeccionar el objeto lead completo ---
    console.log("🔍 [DEPURACIÓN] Lead completo obtenido de Kommo:", JSON.stringify(lead, null, 2));
    // --- FIN LOG DE DEPURACIÓN 1 ---

    // --- LOG DE DEPURACIÓN 2: Inspeccionar los custom_fields_values del lead ---
    console.log("🔍 [DEPURACIÓN] Custom fields del lead:", JSON.stringify(lead.custom_fields_values, null, 2));
    // --- FIN LOG DE DEPURACIÓN 2 ---

    if (!contacto) {
      console.log("⚠️ No se encontró ningún contacto asociado a este lead.");
      return res.status(404).json({
        error: "Contacto no encontrado",
        detalles: {
          tipo: 'contacto_no_encontrado',
          mensaje: "No se encontró un contacto vinculado al lead especificado.",
          timestamp: new Date()
        }
      });
    }
    console.log("🧾 ID del contacto:", contacto.id);

  } catch (err) {
    console.error("❌ Error al obtener contacto desde lead o lead data:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Error interno al obtener datos de Kommo",
      detalles: {
        tipo: 'kommo_api_error',
        mensaje: err.response?.data?.detail || err.message,
        timestamp: new Date()
      }
    });
  }

  const campoMensaje = lead.custom_fields_values?.find(field =>
    field.field_name === "mensajeenviar"
  );
  let mensaje = campoMensaje?.values?.[0]?.value;

  if (!mensaje) {
    // --- LOG DE DEPURACIÓN 3: Indicar que el campo mensajeenviar está vacío, antes de buscar en notas ---
    console.log("⚠️ [DEPURACIÓN] El campo 'mensajeenviar' en el lead (Kommo) no contiene un valor. Intentando buscar el ID en las notas...");
    // --- FIN LOG DE DEPURACIÓN 3 ---
    mensaje = await buscarMensaje(leadId, kommoId, token);
    if (!mensaje) {
      console.log("❌ No se encontró ningún mensaje relevante en el lead ni en sus notas.");
      return res.status(404).json({
        error: "Mensaje de ID no encontrado",
        detalles: {
          tipo: 'mensaje_no_encontrado',
          mensaje: "No se pudo extraer un ID válido de ningún mensaje o campo.",
          timestamp: new Date()
        }
      });
    }
  }
  console.log("📝 Mensaje obtenido (para verificación):", mensaje);

  const idExtraido = mensaje?.match(/\d{13,}/)?.[0];
  console.log("🧾 ID extraído del mensaje:", idExtraido);

  if (!idExtraido) {
    console.log("⚠️ No se pudo extraer un ID válido del mensaje.");
    return res.status(400).json({
      error: "ID no válido en mensaje",
      detalles: {
        tipo: 'id_no_valido',
        mensaje: "El formato del ID extraído no es válido.",
        timestamp: new Date()
      }
    });
  }

  let Modelo;
  if (kommoId === "cajaadmi01") {
    Modelo = RegistroMacleyn;
  } else if (kommoId === "luchito4637") {
    Modelo = RegistroLuchito;
  } else if (kommoId === "blackpanther1") {
    Modelo = RegistroBetone;
  } else if (kommoId === "blackpanther2") {
    Modelo = RegistroBettwo;
  } else if (kommoId === "blackpanther3") {
    Modelo = RegistroBetthree;
  } else if (kommoId === "blackpanther4") {
    Modelo = RegistroBetFour;
  } else if (kommoId === "Ganamosnet") {
    Modelo = RegistroGanamosnet;
  } else if (kommoId === "Cash365") {
    Modelo = RegistroCash365;
  } else if (kommoId === "mctitan") {
    Modelo = Registromctitan;
  } else {
    console.log(`⚠️ Kommo ID desconocido: ${kommoId}`);
    return res.status(400).json({
      error: "Kommo ID no válido o no configurado",
      detalles: {
        tipo: 'kommo_id_desconocido',
        mensaje: `El Kommo ID '${kommoId}' no está configurado para el procesamiento.`,
        timestamp: new Date()
      }
    });
  }

  try {
    let registro = await Modelo.findOne({ id: idExtraido });

    if (!registro) {
      console.log("➕ No se encontró un registro existente en DB, creando uno nuevo.");
      registro = new Modelo({
        id: idExtraido,
        token: token,
        pixel: lead.custom_fields_values?.find(field => field.field_name === "pixel")?.values?.[0]?.value || "PIXEL_DEFAULT_SI_NO_ESTA_EN_KOMMO",
        subdominio: kommoId,
        dominio: "kommo.com",
        ip: req.ip || 'desconocida',
        fbclid: lead.custom_fields_values?.find(field => field.field_name === "fbclid")?.values?.[0]?.value || null,
        mensaje: mensaje,
      });
      await registro.save();
      console.log("✅ Nuevo registro creado en MongoDB.");
    }

    if (registro.isVerified) {
      console.log("Registro ya pixeleado, saltando verificación.");
      return res.status(200).json({
        mensaje: "Registro ya verificado",
        estado: "pre-verificado"
      });
    }

    if (kommoId === "mctitan") {
      const currentCampoMensaje = lead.custom_fields_values?.find(field =>
        field.field_name === "mensajeenviar"
      );
      if (!currentCampoMensaje || currentCampoMensaje.values?.[0]?.value !== idExtraido) {
        console.log(`🔄 [${kommoId}] Actualizando campo 'mensajeenviar' en Kommo con el ID extraído: ${idExtraido}.`);
        await actualizarCampoLead(lead, kommoId, token, "mensajeenviar", idExtraido);
      } else {
        console.log(`✅ [${kommoId}] Campo 'mensajeenviar' en Kommo ya contiene el ID correcto.`);
      }
    }

    const whatsappNumber = contacto.custom_fields_values?.find(field =>
      field.field_code === "PHONE" || field.field_name?.toLowerCase().includes("whatsapp")
    )?.values?.[0]?.value;

    if (whatsappNumber) {
      registro.whatsappNumber = whatsappNumber;
      console.log("📱 Número de WhatsApp guardado en DB:", whatsappNumber);
    }

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

      console.log("Datos del evento a enviar:", JSON.stringify(eventData, null, 2));
      console.log("URL del Pixel:", pixelEndpointUrl);

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

      console.log("📡 Pixel ejecutado con éxito:", pixelResponse.data);
      return res.status(200).json({
        mensaje: "Verificación completada exitosamente",
        estado: "verificado"
      });

    } catch (error) {
      console.error("❌ Error al ejecutar el pixel:", error.response?.data || error.message);

      registro.isVerified = false;
      registro.verificationStatus = 'fallido';
      registro.verificationError = {
        tipo: 'pixel_error',
        mensaje: error.response?.data?.error?.message || error.message,
        timestamp: new Date()
      };
      await registro.save();

      if (error.response) {
        console.error("Estado del error:", error.response.status);
        console.error("Encabezados del error:", error.response.headers);
        console.error("Datos del error:", error.response.data);
      } else if (error.request) {
        console.error("No se recibió respuesta del servidor:", error.request);
      } else {
        console.error("Error desconocido:", error.message);
      }

      return res.status(500).json({
        error: "Error al ejecutar el pixel",
        detalles: registro.verificationError
      });
    }
  } catch (error) {
    console.error("Error general al buscar o actualizar el registro:", error);
    return res.status(500).json({
      error: "Error interno al procesar el registro",
      detalles: {
        tipo: 'error_interno_registro',
        mensaje: error.message,
        timestamp: new Date()
      }
    });
  }
});

// Funciones auxiliares con logs de depuración añadidos
async function buscarMensaje(leadId, kommoId, token, reintentos = 3) { // reintentos sigue en 3
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
        // --- LOG DE DEPURACIÓN 4: Mostrar todas las notas encontradas y sus tipos ---
        if (notas.length > 0) {
          console.log(`🔍 [DEPURACIÓN] Notas encontradas para ${tipoEntidad} (Intento ${intento}):`, JSON.stringify(notas.map(n => ({ id: n.id, type: n.note_type, text: n.params?.text, created_at: n.created_at })), null, 2));
        } else {
          console.log(`🔍 [DEPURACIÓN] No se encontraron notas para ${tipoEntidad} (Intento ${intento}).`);
        }
        // --- FIN LOG DE DEPURACIÓN 4 ---

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
          console.log(`🔄 [${tipoEntidad}] Intento ${intento}/${reintentos}: sin notas aún o 404...`);
        }
      }

      await delay(1500); // espera 1.5 segundos antes de reintentar (delay original)
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});