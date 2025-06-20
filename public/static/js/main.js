// init the modal
window.addEventListener('load', () => {
    try {
        const myModal = new bootstrap.Modal(document.getElementById('message'));
        myModal.show();
    } catch (err) {
        console.error('Could not initialize bootstrap modal');
        console.error(err);
    }
});