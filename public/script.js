document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const fetchBtn = document.getElementById('fetchBtn');
    const btnText = fetchBtn.querySelector('.btn-text');
    const spinner = document.getElementById('fetchSpinner');
    const errorMsg = document.getElementById('errorMsg');
    const resultCard = document.getElementById('resultCard');
    const thumbnail = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const descargarVideoBtn = document.getElementById('descargarVideoBtn');
    const descargarAudioBtn = document.getElementById('descargarAudioBtn');

    let currentUrl = '';

    fetchBtn.addEventListener('click', fetchVideoInfo);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchVideoInfo();
        }
    });

    async function fetchVideoInfo() {
        const url = urlInput.value.trim();
        if (!url) {
            showError("Por favor, ingresa un enlace de YouTube válido.");
            return;
        }

        // UI en estado de carga
        setLoading(true);
        hideError();
        resultCard.classList.add('hidden');

        try {
            const response = await fetch(`/videoInfo?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Hubo un problema al obtener el video.');
            }

            // Actualizar UI con datos
            currentUrl = url;
            thumbnail.src = data.thumbnail;
            videoTitle.textContent = data.title;
            
            resultCard.classList.remove('hidden');

        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    }

    descargarVideoBtn.addEventListener('click', () => {
        if (currentUrl) {
            window.location.href = `/download?url=${encodeURIComponent(currentUrl)}&format=mp4`;
        }
    });

    descargarAudioBtn.addEventListener('click', () => {
        if (currentUrl) {
            window.location.href = `/download?url=${encodeURIComponent(currentUrl)}&format=mp3`;
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            fetchBtn.disabled = true;
            btnText.style.opacity = '0';
            spinner.classList.remove('hidden');
        } else {
            fetchBtn.disabled = false;
            btnText.style.opacity = '1';
            spinner.classList.add('hidden');
        }
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
    }

    function hideError() {
        errorMsg.classList.add('hidden');
    }
});
