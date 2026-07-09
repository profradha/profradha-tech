// Renders the resume PDF as a continuous, seamlessly scrollable strip of pages.
pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

async function renderResume() {
    const container = document.getElementById('resume-viewer');
    const loading = document.getElementById('resume-loading');
    if (!container) return;

    const url = container.dataset.pdfUrl;

    try {
        const pdf = await pdfjsLib.getDocument({ url }).promise;
        const pageCanvases = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const canvas = document.createElement('canvas');
            canvas.className = 'resume-page';
            container.appendChild(canvas);
            pageCanvases.push({ page, canvas });
        }

        if (loading) loading.remove();

        const renderPage = async ({ page, canvas }) => {
            const devicePixelRatio = window.devicePixelRatio || 1;
            const containerWidth = container.clientWidth;
            const unscaledViewport = page.getViewport({ scale: 1 });
            const scale = containerWidth / unscaledViewport.width;
            const viewport = page.getViewport({ scale: scale * devicePixelRatio });

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = '100%';
            canvas.style.height = 'auto';

            const context = canvas.getContext('2d');
            await page.render({ canvasContext: context, viewport }).promise;
        };

        for (const entry of pageCanvases) {
            await renderPage(entry);
        }

        // Re-render at the new scale when the viewport is resized, so pages stay crisp.
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                pageCanvases.forEach(renderPage);
            }, 250);
        });
    } catch (error) {
        console.error('Error rendering resume PDF:', error);
        if (loading) {
            loading.textContent = 'Unable to load the preview.';
        }
        const fallback = document.createElement('a');
        fallback.className = 'btn btn-secondary';
        fallback.href = url;
        fallback.textContent = 'Download Resume';
        container.appendChild(fallback);
    }
}

document.addEventListener('DOMContentLoaded', renderResume);
