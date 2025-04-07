// Add a data-load attribute to all links you want to show the loading modal for
const loaders = document.querySelectorAll('[data-load]');
const loadingModal: HTMLDialogElement = document.getElementById('loadingModal') as HTMLDialogElement;
if (loadingModal) {
    // Stop the modal from showing if the page is loaded from the cache
    window.addEventListener('pageshow', function (event) {
        if (event.persisted || (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).type === 'back_forward') {
            // Show the loading modal
            loadingModal.close();
        }
    });
}

loaders.forEach((loader) => {
    const anchorLoader = loader as HTMLAnchorElement;
    anchorLoader.addEventListener("click", (e: MouseEvent) => {
        if (e.metaKey || e.ctrlKey) {
            return;
        }
        loadingModal.show();
    });
});

