/**
 * Apex Junior College - Single Reusable Seamless Sidebar Component & SPA Router
 * Provides zero-flicker static sidebar with instant, smooth client-side page transitions.
 */
(function() {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'College Dashboard',
      href: 'dashboard.html',
      icon: 'dashboard',
      badge: null
    },
    {
      id: 'profile',
      label: 'College Profile',
      href: 'index.html',
      icon: 'school',
      badge: null
    },
    {
      id: 'leads',
      label: 'Leads & Admissions',
      href: 'leads.html',
      icon: 'group',
      badge: {
        text: '28 New',
        activeClass: 'px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold whitespace-nowrap shrink-0 shadow-sm',
        inactiveClass: 'px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold whitespace-nowrap shrink-0 border border-amber-400/30'
      }
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: 'analytics.html',
      icon: 'insights',
      badge: {
        isLive: true,
        activeClass: 'flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold whitespace-nowrap shrink-0 border border-emerald-200',
        inactiveClass: 'flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold whitespace-nowrap shrink-0'
      }
    },
    {
      id: 'settings',
      label: 'Settings',
      href: 'settings.html',
      icon: 'settings',
      badge: null
    }
  ];

  function getCurrentPageName() {
    const path = window.location.pathname;
    let page = path.split('/').pop() || 'dashboard.html';
    if (!page || page === '/') page = 'dashboard.html';
    return page;
  }

  function generateSidebarHtml(currentPage) {
    const navLinksHtml = menuItems.map(item => {
      const isActive = currentPage === item.href || (item.href === 'index.html' && currentPage === 'index.html');
      
      let linkClass = '';
      if (isActive) {
        linkClass = 'nav-item flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white text-primary font-bold shadow-sm text-sm transition-all';
      } else {
        linkClass = 'nav-item flex items-center justify-between px-3.5 py-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm font-medium';
      }

      let badgeHtml = '';
      if (item.badge) {
        if (item.badge.isLive) {
          const badgeStyle = isActive ? item.badge.activeClass : item.badge.inactiveClass;
          const pulseColor = isActive ? 'bg-emerald-600' : 'bg-emerald-400';
          badgeHtml = `
            <span class="${badgeStyle}">
              <span class="w-1.5 h-1.5 rounded-full ${pulseColor} animate-pulse"></span> Live
            </span>
          `;
        } else {
          const badgeStyle = isActive ? item.badge.activeClass : item.badge.inactiveClass;
          badgeHtml = `<span class="${badgeStyle}">${item.badge.text}</span>`;
        }
      }

      return `
        <a class="${linkClass}" href="${item.href}" data-nav="${item.id}" ${isActive ? 'aria-current="page"' : ''}>
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="material-symbols-outlined text-[20px] shrink-0">${item.icon}</span>
            <span class="truncate">${item.label}</span>
          </div>
          ${badgeHtml}
        </a>
      `;
    }).join('');

    return `
      <aside id="mainAppSidebar" class="fixed left-0 top-0 h-screen w-64 bg-primary-deep text-white z-50 flex flex-col justify-between p-5 border-r border-[#005144] shadow-lg select-none">
        <div class="flex flex-col gap-6">
          <!-- Apex Brand Logo & Title -->
          <a href="dashboard.html" class="flex items-center gap-3 px-1 transition-opacity hover:opacity-90" data-nav="dashboard">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <span class="material-symbols-outlined text-secondary-container text-[24px]">account_balance</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[17px] font-bold tracking-tight text-white leading-tight">Apex</span>
              <span class="text-[10px] uppercase font-bold tracking-widest text-secondary-container">JUNIOR COLLEGE</span>
            </div>
          </a>

          <!-- Navigation Links -->
          <div class="flex flex-col gap-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-on-primary-container/70 mb-2 px-3">Navigation</div>
            <nav class="flex flex-col gap-1.5" id="sidebarNav">
              ${navLinksHtml}
            </nav>
          </div>
        </div>

        <!-- Academic Session Footer -->
        <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-secondary-container text-[20px]">calendar_month</span>
            <div class="flex flex-col">
              <span class="text-[10px] text-white/70 font-medium">Academic Year</span>
              <span class="text-[12px] font-bold text-secondary-container leading-tight">2025–2026</span>
            </div>
          </div>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
          </span>
        </div>
      </aside>
    `;
  }

  function updateSidebarActiveItem(currentPage) {
    const navContainer = document.getElementById('sidebarNav');
    if (!navContainer) return;

    const links = navContainer.querySelectorAll('a[data-nav]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      const isActive = href === currentPage || (href === 'index.html' && currentPage === 'index.html');
      
      if (isActive) {
        link.className = 'nav-item flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white text-primary font-bold shadow-sm text-sm transition-all';
        link.setAttribute('aria-current', 'page');
        const badge = link.querySelector('span[class*="rounded"]');
        if (badge && !badge.innerText.includes('Live')) {
          badge.className = 'px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold whitespace-nowrap shrink-0 shadow-sm';
        }
      } else {
        link.className = 'nav-item flex items-center justify-between px-3.5 py-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm font-medium';
        link.removeAttribute('aria-current');
        const badge = link.querySelector('span[class*="rounded"]');
        if (badge && !badge.innerText.includes('Live')) {
          badge.className = 'px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold whitespace-nowrap shrink-0 border border-amber-400/30';
        }
      }
    });
  }

  // Seamless Client-Side Page Switcher (No sidebar flash/reload)
  async function navigateToPage(targetUrl, pushState = true) {
    const targetPage = targetUrl.split('/').pop() || 'dashboard.html';
    const currentPage = getCurrentPageName();

    if (targetPage === currentPage && pushState) {
      return;
    }

    // Immediately update sidebar state for snappy instant feel
    updateSidebarActiveItem(targetPage);

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const htmlText = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // Update page title
      if (doc.title) {
        document.title = doc.title;
      }

      // Find content wrapper (.pl-64) in current and new document
      const currentWrapper = document.querySelector('.pl-64');
      const newWrapper = doc.querySelector('.pl-64');

      if (currentWrapper && newWrapper) {
        // Smooth transition effect
        currentWrapper.style.opacity = '0.7';
        currentWrapper.style.transition = 'opacity 0.15s ease-out';
        
        setTimeout(() => {
          currentWrapper.innerHTML = newWrapper.innerHTML;
          currentWrapper.style.opacity = '1';
          window.scrollTo({ top: 0, behavior: 'instant' });

          // Re-execute scripts from target page
          const scripts = doc.querySelectorAll('script:not([src="sidebar.js"]):not(#tailwind-config)');
          scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.textContent = oldScript.textContent;
            document.body.appendChild(newScript);
          });

          // Also execute inline initialization if present
          if (window.initPage) {
            try { window.initPage(); } catch(e) {}
          }
        }, 150);
      } else {
        // Fallback
        window.location.href = targetUrl;
        return;
      }

      if (pushState) {
        window.history.pushState({ path: targetUrl }, '', targetUrl);
      }
    } catch (err) {
      // If local file:// protocol prevents fetch, fallback gracefully to normal navigation
      console.warn('SPA navigation fallback:', err);
      window.location.href = targetUrl;
    }
  }

  function attachLinkHandlers() {
    const aside = document.getElementById('mainAppSidebar');
    if (!aside) return;

    aside.addEventListener('click', function(e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      // Intercept internal page navigation for smooth SPA feel
      if (href.endsWith('.html') || href === 'dashboard.html' || href === 'index.html' || href === 'leads.html' || href === 'analytics.html' || href === 'settings.html') {
        e.preventDefault();
        navigateToPage(href, true);
      }
    });
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function() {
    const targetPage = getCurrentPageName();
    navigateToPage(targetPage, false);
  });

  // Initial render
  function initSidebar() {
    const currentPage = getCurrentPageName();
    const existingSidebar = document.getElementById('mainAppSidebar');
    
    if (!existingSidebar) {
      const container = document.getElementById('sidebar-container');
      const html = generateSidebarHtml(currentPage);
      if (container) {
        container.innerHTML = html;
      } else {
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.prepend(div.firstElementChild);
      }
    } else {
      updateSidebarActiveItem(currentPage);
    }

    attachLinkHandlers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
})();
