(function() {
  document.documentElement.classList.add('js');

  var yearEl = document.getElementById('year');
  if(yearEl) { yearEl.textContent = new Date().getFullYear(); }

  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if(toggle && links) {
    toggle.addEventListener('click', function() {
      var isOpen = links.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var nav = document.querySelector('.nav');
  if(nav) {
    window.addEventListener('scroll', function() {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    }, {passive:true});
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion) {
    document.querySelectorAll('.packet-anim').forEach(function(el){ el.remove(); });
  }

  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduceMotion) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if(entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:0.15, rootMargin:'0px 0px -40px 0px'});
    revealEls.forEach(function(el) { obs.observe(el); });
  } else {
    revealEls.forEach(function(el) { el.classList.add('is-visible'); });
  }

  // Handle contact form submission
  var form = document.getElementById('contact-form');
  if(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var card = document.getElementById('formCard');
      var confirmBox = document.getElementById('form-confirm');
      var submitBtn = form.querySelector('button[type="submit"]');
      
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      var formData = new FormData(form);
      var data = Object.fromEntries(formData.entries());

      fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        if(card) { card.classList.add('submitted'); }
        if(confirmBox) { confirmBox.classList.add('show'); confirmBox.focus(); }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting your request. Please try again later.');
        submitBtn.textContent = 'Send message';
        submitBtn.disabled = false;
      });
    });
  }
})();
