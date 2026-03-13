const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/videoInfo', async (req, res) => {
    try {
        let url = req.query.url;
        
        // Limpiar URL: si tiene parámetros adicionales como &list=
        if (url.includes('&list=')) {
            const urlObj = new URL(url);
            url = urlObj.origin + urlObj.pathname + '?v=' + urlObj.searchParams.get('v');
        }

        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true
        });

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            lengthSeconds: info.duration,
        });
    } catch (error) {
        console.error("Error al obtener info:", error.message);
        res.status(500).json({ error: 'Error al procesar el video. YouTube puede estar bloqueando esta petición.' });
    }
});

app.get('/download', async (req, res) => {
    try {
        let url = req.query.url;
        const format = req.query.format;
        
        if (url.includes('&list=')) {
            const urlObj = new URL(url);
            url = urlObj.origin + urlObj.pathname + '?v=' + urlObj.searchParams.get('v');
        }

        const info = await youtubedl(url, { dumpSingleJson: true, noCheckCertificates: true, noWarnings: true });
        const title = info.title.replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, '_');

        if (format === 'mp3') {
            // Descargamos en formato nativo m4a que no requiere ffmpeg
            res.header('Content-Disposition', `attachment; filename="${title}.m4a"`);
            const audioStream = youtubedl.exec(url, {
                format: 'bestaudio[ext=m4a]/bestaudio',
                output: '-', // Imprimir al stdout
                noCheckCertificates: true,
                noWarnings: true
            });
            audioStream.stdout.pipe(res);
        } else {
            // Descargamos el mejor video pre-mezclado en mp4
            res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
            const videoStream = youtubedl.exec(url, {
                format: 'best[ext=mp4]/best',
                output: '-', 
                noCheckCertificates: true,
                noWarnings: true
            });
            videoStream.stdout.pipe(res);
        }

    } catch (error) {
        console.error("Error al descargar:", error.message);
        res.status(500).send('Hubo un error al intentar descargar el archivo.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de Descargas activo en http://localhost:${PORT}`);
});
