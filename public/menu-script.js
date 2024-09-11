document.addEventListener('DOMContentLoaded', function() {
    const clickableCards = document.querySelectorAll('.card.clickable');
    const resumeCard = document.getElementById('resume-card');
    const resumePopup = document.getElementById('resume-popup');
    const resumeIframe = document.getElementById('resume-iframe');
    const aboutButton = document.getElementById('card2');
    const aboutPopup = document.getElementById('about-popup');
    const overlay = document.getElementById('overlay');
    const closeButton = document.querySelector('.close-button');

    clickableCards.forEach(card => {
        card.addEventListener('click', function() {
            const cardId = this.id;
            switch(cardId) {
                case 'card1':
                    console.log('Projects clicked');
                    console.log('Projects clicked');
                    window.location.href = 'projects.html'; // Redirect to projects page
                    break;
                case 'card2':
                    console.log('About clicked');
                    openPopup(aboutPopup);
                    break;
                case 'resume-card':
                    console.log('Resume clicked');
                    openResumePopup();
                    break;
                case 'card5':
                    console.log('Contact clicked');
                    // Add action for Contact
                    break;
            }
        });
    });

    function openPopup(popup) {
        overlay.style.display = 'block';
        popup.style.display = 'block';
    }

    function closePopup(popup) {
        overlay.style.display = 'none';
        popup.style.display = 'none';
    }

    function openResumePopup() {
        resumeIframe.src = 'Rohan_Yogananda_RESUME.pdf';
        openPopup(resumePopup);
    }

    // Close buttons for popups
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const popup = this.closest('.popup');
            closePopup(popup);
            if (popup === resumePopup) {
                resumeIframe.src = '';
            }
        });
    });

    // Close popup when clicking outside of it
    overlay.addEventListener('click', function() {
        closePopup(aboutPopup);
        closePopup(resumePopup);
    });

    // Prevent the popup from closing when clicking inside it
    document.querySelectorAll('.popup-content').forEach(content => {
        content.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });

    // Handle wrong button click (assuming this is for the main close button)
    function handleWrongButtonClick() {
        const fadeOverlay = document.getElementById('fade-overlay');
        fadeOverlay.classList.add('active');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }

    if (closeButton) {
        closeButton.addEventListener('click', handleWrongButtonClick);
    } else {
        console.error('Close button not found');
    }
});