// Immediately-executing function to encapsulate the share-modal logic
(function () {
  // 1) Inject CSS for modal, animations, and buttons
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
    .share-container {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.4);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .share-box {
      background: #fff;
      border-radius: 16px;
      padding: 30px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center;
      position: relative;
    }
    .share-box .close-btn {
      position: absolute;
      top: 12px; right: 12px;
      background: none;
      border: none;
      font-size: 24px;
      color: #999;
      cursor: pointer;
    }
    .share-box h2 {
      margin-top: 0;
      font-size: 22px;
      color: #2c3e50;
    }
    .share-box p {
      font-size: 14px;
      color: #7f8c8d;
      margin-bottom: 25px;
    }
    .share-box button,
    .share-box a {
      margin: 8px;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .share-box button:hover,
    .share-box a:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .share-copy {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: #fff;
      border: none;
    }
    .share-facebook {
      background: #3b5998;
      color: #fff;
    }
    .share-twitter {
      background: #1da1f2;
      color: #fff;
    }
    .share-whatsapp {
      background: #25d366;
      color: #fff;
    }
  `;
  document.head.appendChild(style);

  // 2) Create the share-modal container and its inner HTML
  const container = document.createElement('div');
  container.className = 'share-container';
  container.id = 'shareContainer';
  container.innerHTML = `
    <div class="share-box">
      <button class="close-btn" id="shareCloseBtn">&times;</button>
      <h2>Share this page</h2>
      <p>Send to your friends or copy the link below.</p>
      <button class="share-copy" id="copyLinkBtn">
        <i class="bx bx-copy"></i>
        Copy Link
      </button>
      <a class="share-facebook" href="#" target="_blank" rel="noopener" id="facebookShare">
        <i class="bx bxl-facebook-circle"></i>
        Facebook
      </a>
      <a class="share-twitter" href="#" target="_blank" rel="noopener" id="twitterShare">
        <i class="bx bxl-twitter"></i>
        Twitter
      </a>
      <a class="share-whatsapp" href="#" target="_blank" rel="noopener" id="whatsappShare">
        <i class="bx bxl-whatsapp"></i>
        WhatsApp
      </a>
    </div>
  `;
  document.body.appendChild(container);

  // 3) Grab references to dynamically-updated elements
  const shareContainer = document.getElementById('shareContainer');
  const closeBtn = document.getElementById('shareCloseBtn');
  const copyBtn = document.getElementById('copyLinkBtn');
  const fbLink = document.getElementById('facebookShare');
  const twLink = document.getElementById('twitterShare');
  const waLink = document.getElementById('whatsappShare');

  // 4) Function to open the modal: populate URLs and show with fadeIn
  function openShareContainer() {
    const encodedURL = encodeURIComponent(window.location.href);
    fbLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`;
    twLink.href = `https://twitter.com/intent/tweet?url=${encodedURL}`;
    waLink.href = `https://api.whatsapp.com/send?text=${encodedURL}`;

    shareContainer.style.display = 'flex';
    shareContainer.style.animation = 'fadeIn 0.3s ease-out forwards';
    document.body.style.overflow = 'hidden';
  }

  // 5) Function to close the modal: fadeOut then hide
  function closeShareContainer() {
    shareContainer.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      shareContainer.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }

  // 6) Function to copy current URL to clipboard
  async function copyCurrentLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('✅ Link copied to clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
      alert('❌ Could not copy link. Please copy manually.');
    }
  }


  closeBtn.addEventListener('click', closeShareContainer);
  copyBtn.addEventListener('click', copyCurrentLink);

  // 8) When DOM is ready, attach click listener to .engage i.bx-share parent
  document.addEventListener('DOMContentLoaded', () => {
    const shareBtn = document.querySelector('.engage i.bx-share')?.parentElement;
    if (!shareBtn) return;
    shareBtn.style.cursor = 'pointer';
    shareBtn.style.transition = 'transform 0.2s ease';
    shareBtn.addEventListener('mouseenter', () => shareBtn.style.transform = 'scale(1.1)');
    shareBtn.addEventListener('mouseleave', () => shareBtn.style.transform = 'scale(1)');
    shareBtn.addEventListener('click', openShareContainer);
  });
})();


// Print functionality for the recipe page
document.addEventListener('DOMContentLoaded', function () {
  const printButton = document.getElementById('print-button');

  if (printButton) {
    printButton.addEventListener('click', function () {
      printPage();
    });
  }
});

function printPage() {
  // Hide elements that shouldn't appear in print
  hideElementsForPrint();

  // Configure print settings
  const printWindow = window.open('', '_blank');
  const currentContent = document.documentElement.outerHTML;

  // Create print-friendly version
  printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Recipe - ${document.title}</title>
            <link rel="stylesheet" href="https://unpkg.com/boxicons@latest/css/boxicons.min.css">
            <link href='https://cdn.boxicons.com/fonts/basic/boxicons.min.css' rel='stylesheet'>
    <link href='https://cdn.boxicons.com/fonts/brands/boxicons-brands.min.css' rel='stylesheet'>
            <style>
                /* Print-specific styles */
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                    }
                    
                    /* Hide navigation and interactive elements */
                    .header, .nav, .menu, .engagement, .engage-container,
                    .rate-container, button, .video-overlay, .play-button,
                    iframe, .thumbnailOverlay {
                        display: none !important;
                    }
                    
                    /* Optimize layout for print */
                    .ad {
    height: 200px;
    width: 1200px;
    background-color: grey;
    position: relative;
    left: 20px;
    border-radius: 20px;
}

.ad h3 {
    position: absolute;
    top: 100px;
    left: 20px;
    font-weight: 500;
    color: white;
}

.ad h2 {
    position: absolute;
    top: 120px;
    left: 20px;
    font-size: 34px;
}

.stages {
    height: 100px;
    width: 1200px;
    /* background-color: grey; */
    position: relative;
    top: 20px;
    left: 30px;
    display: flex;
    gap: 100px;
}

.food_details {
    height: 100px;
    width: 200px;
    /* background-color: red; */
    position: relative;
    display: flex;
    left: 40px;

}

#name {
    position: relative;
    left: 0px;
    bottom: 5px;
}

#the-name {
    width: 240px;
    bottom: 5px;
    bottom: 5px;

}

.icon {
    height: 50px;
    width: 60px;
    background-color: rgba(212, 184, 0, 0.543);
    border-radius: 10px;
    position: relative;
    top: 24px;
    text-align: center;
}

.icon i {
    font-size: 34px;
    position: relative;
    top: 6px;
    color: #FFBF00;
}



.name {
    height: 100px;
    width: 150px;
    /* background-color: white; */
    position: relative;
    top: 25px;
    bottom: 5px;
}

.name .heads {
    height: 20px;
    width: 150px;
    /* background-color: blue; */
    position: relative;
    left: 7px;
    bottom: 5px;
}

.name .heads h2 {
    font-size: 16px;
    font-weight: 400;
    bottom: 5px;


}


.foodname {
    height: 40px;
    width: 100px;
    /* background-color: #FFBF00; */
    left: 7px;
    position: relative;
    width: 150px;
    bottom: 5px;
}

.foodname h2 {
    font-weight: 600;
    font-size: 18px;
    position: relative;
    bottom: 15px;
}


.description {
    height: 300px;
    width: 100%;
    /* background-color: grey; */
    position: relative;
    top: 10px;
    display: flex;
    gap: 60px;
    bottom: 5px;
}

.description_text {
    width: 670px;
    /* background-color: red; */
    height: 300px;
    position: relative;
    left: 30px;
    display: block;
    bottom: 8px;
}



.food_image {
    height: 300px;
    width: 490px;
    /* background-color: blue; */
    position: relative;
    border-radius: 20px;
    overflow: hidden;
}

.food_image img {
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.desc {
    height: 40px;
    width: 200px;
    /* background-color: white; */
    position: relative;
    top: 10px;
}

.text {
    height: 230px;
    width: 650px;
    /* background-color: rgb(52, 37, 37); */
    position: relative;
    top: 20px;
    word-wrap: break-word;
    font-size: 18px;
}

.text h2 {
    font-weight: 400;
    font-size: 22px;
}

.desc h2 {
    font-weight: 500;
    position: relative;
    top: 4px;
}



.contains {
    height: 320px;
    width: 100%;
    /* background-color: grey; */
    position: relative;
    top: 40px;
    display: flex;
    overflow: hidden;
}

.consists {
    height: 300px;
    width: 700px;
    background-color: #fff;
    position: relative;
    left: 30px;
    border-radius: 20px;
    box-shadow: 1px 1px 10px #5d713a;
}

.conts {
    height: 50px;
    width: 400px;
    /* background-color: red; */
    position: relative;
    left: 20px;

}

.conts h2 {
    font-size: 20px;
    position: relative;
    top: 10px;
}

.itemss {
    height: 250px;
    width: 500px;
    /* background-color: blue; */
    /* display: block; */
    /* overflow: auto; */
    /* grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); */
}

.itemss ol {
    font-size: 20px;
    font-weight: 400;
    position: relative;
    left: 0px;
    column-width: 180px;
    /* try 200px per column */
    column-gap:0px;
    /* space between columns */
    column-fill: auto;
    /* fill columns sequentially */
    list-style-position: inside;
}


.itemss ol li {
  break-inside: avoid-column;
}

/* Force a column break after every 7th item */
.itemss ol li:nth-child(7n) {
  break-after: column;
}


.nutritions {
    height: 300px;
    width: 480px;
    background-color: #fff;
    position: relative;
    left: 40px;
    border-radius: 20px;
    box-shadow: 1px 5px 10px #c5cabe;
}



.nutrition {
    height: 40px;
    width: 300px;
    /* background-color: blue; */

}

.nutrition h2 {
    font-size: 20px;
    position: relative;
    top: 0px;
    left: 40px;
}

.nuts {
    height: 250px;
    width: 500px;
    /* background-color: rgb(212, 188, 188); */
    display: block;
    
}

.nuts h2 {
    font-size: 18px;
    font-weight: 400;
    position: relative;
    left: 40px;
}

.ad img {
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.ad {
    overflow: hidden;
}

.ad h2 {
    color: #FFBF00;
}

.nav {
    display: none;
}

.menu {
    display: none;
}


.steps {
    height: 300px;
    width: 100%;
    /* background-color: grey; */
    position: relative;
    top: 60px;
}


.step {
    height: 250px;
    width: 600px;
    /* background-color: whitesmoke; */
    position: relative;
    left: 40px;
}

.step-count {
    position: relative;
    top: 10px;
    font-size: 20px;
    font-weight: 600;
}

.step-info {
    position: relative;
    top: 10px;
    left: 10px;
    /* background-color: green; */
}
                
                /* Apply print styles immediately */
                ${getPrintStyles()}
            </style>
        </head>
        <body>
            ${document.body.innerHTML}
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
                Printed on ${new Date().toLocaleDateString()} from Recipe Collection
            </div>
        </body>
        </html>
    `);

  printWindow.document.close();

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();

    // Close the print window after printing
    setTimeout(() => {
      printWindow.close();
      // Restore hidden elements
      showElementsAfterPrint();
    }, 1000);
  }, 500);
}

function hideElementsForPrint() {
  const elementsToHide = [
    '.header', '.nav', '.menu', '.engagement',
    '.engage-container', '.rate-container',
    '.video-overlay', '.play-button', '.thumbnailOverlay'
  ];

  elementsToHide.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.style.display = 'none';
    });
  });

  // Hide iframe (YouTube video)
  const iframe = document.querySelector('iframe');
  if (iframe) {
    iframe.style.display = 'none';
  }
}

function showElementsAfterPrint() {
  const elementsToShow = [
    '.header', '.nav', '.menu', '.engagement',
    '.engage-container', '.rate-container',
    '.video-overlay', '.play-button', '.thumbnailOverlay'
  ];

  elementsToShow.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.style.display = '';
    });
  });

  // Show iframe
  const iframe = document.querySelector('iframe');
  if (iframe) {
    iframe.style.display = '';
  }
}

function getPrintStyles() {
  return `
        .header, .nav, .menu, .engagement, .engage-container,
        .rate-container, button, .video-overlay, .play-button,
        iframe, .thumbnailOverlay {
            display: none !important;
        }
        
        body {
    background-color: white;
    margin: 0px;
    padding: 0px;
    font-family: 'Poppins', sans-serif;
}
        
        .ad {
    height: 200px;
    width: 1200px;
    background-color: grey;
    position: relative;
    left: 10px;
    border-radius: 20px;
}

.ad h3 {
    position: absolute;
    top: 100px;
    left: 20px;
    font-weight: 500;
    color: white;
}

.ad h2 {
    position: absolute;
    top: 120px;
    left: 20px;
    font-size: 34px;
}

.stages {
    height: 100px;
    width: 1200px;
    /* background-color: grey; */
    position: relative;
    top: 20px;
    left: 30px;
    display: flex;
    gap: 100px;
}

.food_details {
    height: 100px;
    width: 200px;
    /* background-color: red; */
    position: relative;
    display: flex;
    left: 40px;

}

#name {
    position: relative;
    left: 0px;
}

#the-name {
    width: 240px;
    bottom: 5px;

}

.icon {
    height: 50px;
    width: 60px;
    background-color: rgba(212, 184, 0, 0.543);
    border-radius: 10px;
    position: relative;
    top: 24px;
    text-align: center;
}

.icon i {
    font-size: 34px;
    position: relative;
    top: 6px;
    color: #FFBF00;
}



.name {
    height: 100px;
    width: 150px;
    /* background-color: white; */
    position: relative;
    top: 25px;
    
}

.name .heads {
    height: 20px;
    width: 150px;
    /* background-color: blue; */
    position: relative;
    left: 7px;
    bottom: 18px;
}

.name .heads h2 {
    font-size: 16px;
    font-weight: 400;


}


.foodname {
    height: 40px;
    width: 100px;
    /* background-color: #FFBF00; */
    left: 7px;
    position: relative;
    width: 150px;
    bottom: 15px;
}

.foodname h2 {
    font-weight: 600;
    font-size: 18px;
    position: relative;
}


.description {
    height: 300px;
    width: 100%;
    /* background-color: grey; */
    position: relative;
    display: flex;
    gap: 60px;
    bottom: 5px;
}

.description_text {
    width: 670px;
    /* background-color: red; */
    height: 300px;
    position: relative;
    left: 30px;
    display: block;
}



.food_image {
    height: 300px;
    width: 490px;
    /* background-color: blue; */
    position: relative;
    border-radius: 20px;
    overflow: hidden;
}

.food_image img {
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.desc {
    height: 40px;
    width: 200px;
    /* background-color: white; */
    position: relative;
    top: 10px;
}

.text {
    height: 230px;
    width: 650px;
    /* background-color: rgb(52, 37, 37); */
    position: relative;
    top: 20px;
    word-wrap: break-word;
    font-size: 18px;
}

.text h2 {
    font-weight: 400;
    font-size: 22px;
}

.desc h2 {
    font-weight: 500;
    position: relative;
    top: 4px;
}



.contains {
    height: 320px;
    width: 100%;
    /* background-color: grey; */
    position: relative;
    top: 40px;
    display: flex;
    overflow: hidden;
}

.consists {
    height: 300px;
    width: 700px;
    background-color: #fff;
    position: relative;
    left: 30px;
    border-radius: 20px;
    box-shadow: 1px 1px 10px #5d713a;
}

.conts {
    height: 50px;
    width: 400px;
    /* background-color: red; */
    position: relative;
    left: 20px;

}

.conts h2 {
    font-size: 20px;
    position: relative;
    top: 10px;
}

.itemss {
    height: 250px;
    width: 500px;
    /* background-color: blue; */
    /* display: block; */
    /* overflow: auto; */
    /* grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); */
}

.itemss ol {
    font-size: 20px;
    font-weight: 400;
    position: relative;
    left: 30px;
    column-width: 180px;
    /* try 200px per column */
    column-gap:0px;
    /* space between columns */
    column-fill: auto;
    /* fill columns sequentially */
    list-style-position: inside;
}


.itemss ol li {
  break-inside: avoid-column;
}

/* Force a column break after every 7th item */
.itemss ol li:nth-child(7n) {
  break-after: column;
}


.nutritions {
    height: 300px;
    width: 480px;
    background-color: #fff;
    position: relative;
    left: 40px;
    border-radius: 20px;
    box-shadow: 1px 5px 10px #c5cabe;
}



.nutrition {
    height: 40px;
    width: 300px;
    /* background-color: blue; */

}

.nutrition h2 {
    font-size: 20px;
    position: relative;
    top: 10px;
    left: 40px;
}

.nuts {
    height: 250px;
    width: 500px;
    /* background-color: rgb(212, 188, 188); */
    display: flex;
    flex-direction: column;
    /* Stack items vertically */
    gap: 10px;
}

.nuts h2 {
    font-size: 18px;
    font-weight: 400;
    position: relative;
    left: 40px;
    top: 10px;
}

.ad img {
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.ad {
    overflow: hidden;
}

.ad h2 {
    color: #FFBF00;
}

.nav {
    display: none;
}

.menu {
    display: none;
}


.steps {
    height: 300px;
    width: 100%;
    /* background-color: grey; */
    position: relative;
    top: 60px;
}


.step {
    height: 250px;
    width: 600px;
    /* background-color: whitesmoke; */
    position: relative;
    left: 40px;
}

.step-count {
    position: relative;
    top: 10px;
    font-size: 20px;
    font-weight: 600;
}

.step-info {
    position: relative;
    top: 10px;
    left: 10px;
    /* background-color: green; */
}
    `;
}

// Alternative simpler approach using window.print()
function simplePrintPage() {
  // Hide elements that shouldn't be printed
  hideElementsForPrint();

  // Add print styles to current page
  const printStyles = document.createElement('style');
  printStyles.innerHTML = `
        @media print {
            ${getPrintStyles()}
        }
    `;
  document.head.appendChild(printStyles);

  // Print the page
  window.print();

  // Clean up after print dialog closes
  setTimeout(() => {
    document.head.removeChild(printStyles);
    showElementsAfterPrint();
  }, 1000);
}