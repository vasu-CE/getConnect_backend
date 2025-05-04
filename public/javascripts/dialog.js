// Function to handle opening and closing modals
function setupModals() {
    // Get all modal triggers and modals
    var openModalBtns = document.querySelectorAll('.openModalBtn');
    var modals = document.querySelectorAll('.modal');
    
    // Open modal
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            var modalId = this.getAttribute('data-modal');
            var modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
            }
        });
    });

    // Close modal
    modals.forEach(modal => {
        var closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    });

    // Close modal when clicking outside of modal content
    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Initialize modals on page load
document.addEventListener('DOMContentLoaded', setupModals);
