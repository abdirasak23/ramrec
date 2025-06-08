// Immediately-executing function to encapsulate the share-modal logic
(function() {
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
  const closeBtn       = document.getElementById('shareCloseBtn');
  const copyBtn        = document.getElementById('copyLinkBtn');
  const fbLink         = document.getElementById('facebookShare');
  const twLink         = document.getElementById('twitterShare');
  const waLink         = document.getElementById('whatsappShare');

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
