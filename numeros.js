document.querySelectorAll(".openWpp").forEach((button) => {
  button.addEventListener("click", async function () {
    // Obtener fbclid si existe
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get("fbclid");

    // Obtener configuración dinámica
    const subdominio = window.location.hostname.split(".")[0];

    try {
      const config = await fetch(
        "https://ahora4633.io/backend/get_config.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subdominio }),
        }
      ).then((res) => res.json());

      if (config.error) {
        console.error("❌ Error al obtener configuración:", config.error);
        return;
      }

      // 1. Generar ID único numérico
      const generarIdUnico = () => {
        return Date.now() + Math.floor(Math.random() * 1000);
      };

      // 2. Obtener IP pública (usando un servicio externo)
      await fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then((data) => {
          const ip = data.ip;
          const idUnico = generarIdUnico();

          // Obtener número de WhatsApp y mensaje
          const links = config.numeros.map((n) => `https://wa.me/${n}`);
          const mensaje = encodeURIComponent(
            "mi id es : " + idUnico + ", " + config.mensaje_wpp
          );
          
          // Seleccionar un número aleatorio y su URL
          const randomIndex = Math.floor(Math.random() * links.length);
          const randomLink = links[randomIndex];
          const whatsappNumber = config.numeros[randomIndex]; // Obtener el número seleccionado
          const redirectUrl = `${randomLink}?text=${mensaje}`;

          // 3. Armar objeto con todos los datos
          const newData = {
            id: idUnico.toString(),
            token: config.token,
            pixel: config.meta_pixel_id,
            subdominio,
            dominio: config.dominio,
            ip: ip,
            fbclid,
            mensaje,
            whatsappNumber // Agregar el número de WhatsApp
          };

          console.log("📦 Datos a enviar:", newData);

          // Enviar al backend con fetch
          fetch("https://server-pixelluchito.onrender.com/guardar", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newData),
          })
            .then(async (response) => {
              console.log("🔍 Estado de la respuesta:", response.status);
              console.log("🏢 Subdominio enviado:", subdominio);
              
              // Intentar obtener el cuerpo de la respuesta como texto primero
              const responseText = await response.text();
              console.log("📄 Respuesta del servidor:", responseText);
              
              // Intentar parsear como JSON si es posible
              let responseData;
              try {
                responseData = JSON.parse(responseText);
                console.log("✅ Respuesta parseada:", responseData);
              } catch (e) {
                console.log("⚠️ Respuesta no es JSON:", responseText);
                // Si no es JSON, seguimos con la redirección
                window.location.href = redirectUrl;
                return;
              }

              // Si tenemos JSON, verificamos si hay error
              if (!response.ok) {
                console.error("❌ Error del servidor:", responseData);
                // A pesar del error, seguimos con la redirección
                window.location.href = redirectUrl;
                return;
              }

              console.log("✅ Datos guardados:", responseData);
              console.log("🔄 Redirigiendo a:", redirectUrl);
              // Redirigir después de procesar la respuesta
              window.location.href = redirectUrl;
            })
            .catch((error) => {
              console.error("❌ Error en la petición:", error);
              console.log("🔄 Redirigiendo a pesar del error:", redirectUrl);
              // Redirigir incluso si hay error
              window.location.href = redirectUrl;
            });
        });
    } catch (error) {
      console.error("❌ Error en la configuración o proceso general:", error);
      // Si el error ocurre al obtener la configuración principal,
      // no hay datos para redirigir, solo se registra el error.
    }
  });
});
