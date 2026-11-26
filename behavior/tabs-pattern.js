const TAB_CLICK_EVENT = 'tab:click';
const TAB_NEXT_EVENT = 'tab:next';
const TAB_PREV_EVENT = 'tab:prev';

function render(openTabId, openPanelId, $tabs, $panels) {
  $tabs.forEach(function update($tab) {
    var isSelected = openTabId == $tab.id;
    $tab.tabIndex = isSelected ? 0 : -1;
    $tab.ariaSelected = isSelected ? 'true' : 'false';
    if (isSelected) $tab.focus();
  });

  $panels.forEach(function update($panel) {
    var isSelected = $panel.id == openPanelId;
    $panel.hidden = !isSelected;
  });
}

var createHandlerFor = {
  [TAB_CLICK_EVENT]: function createHandler($tabs, $panels) {
    return function handler(event) {
      var $tab = event.target;
      var openTabId = $tab.id;
      var openPanelId = $tab.getAttribute('aria-controls');
      render(openTabId, openPanelId, $tabs, $panels);
    };
  },

  [TAB_NEXT_EVENT]: function createHandler($tabs, $panels) {
    return function handler() {
      var openTabIndex = $tabs.findIndex(function isAriaSelected($tab) {
        return $tab.ariaSelected == 'true';
      });

      var nextOpenTabIndex = (function next() {
        if (openTabIndex == -1 || openTabIndex == $tabs.length - 1) return 0;
        return openTabIndex + 1;
      })();

      var nextOpenTab = $tabs[nextOpenTabIndex];

      render(
        nextOpenTab.id,
        nextOpenTab.getAttribute('aria-controls'),
        $tabs,
        $panels
      );
    };
  },

  [TAB_PREV_EVENT]: function createHandler($tabs, $panels) {
    return function handler() {
      var openTabIndex = $tabs.findIndex(function isAriaSelected($tab) {
        return $tab.ariaSelected == 'true';
      });

      var nextOpenTabIndex = (function next() {
        if (openTabIndex == 0) return $tabs.length - 1;
        return openTabIndex - 1;
      })();

      var nextOpenTab = $tabs[nextOpenTabIndex];

      render(
        nextOpenTab.id,
        nextOpenTab.getAttribute('aria-controls'),
        $tabs,
        $panels
      );
    };
  },
};

function initTabList($tablist) {
  $tablist.addEventListener('keydown', function onKeyDown(event) {
    var cases = {
      ArrowRight() {
        $tablist.dispatchEvent(
          new CustomEvent(TAB_NEXT_EVENT, { bubbles: true })
        );
      },
      ArrowLeft() {
        $tablist.dispatchEvent(
          new CustomEvent(TAB_PREV_EVENT, { bubbles: true })
        );
      },
    };

    cases[event.key]?.();
  });
}

function initTab($tab) {
  $tab.addEventListener('click', function onClick() {
    $tab.dispatchEvent(new CustomEvent(TAB_CLICK_EVENT, { bubbles: true }));
  });
}

function init($root) {
  var $tablist = $root.querySelector('[role="tablist"]');
  var $tabs = [...$tablist.querySelectorAll('[role="tab"]')];
  var $panels = [...$root.querySelectorAll('[role="tabpanel"]')];

  $root.addEventListener(
    TAB_CLICK_EVENT,
    createHandlerFor[TAB_CLICK_EVENT]($tabs, $panels)
  );
  $root.addEventListener(
    TAB_PREV_EVENT,
    createHandlerFor[TAB_PREV_EVENT]($tabs, $panels)
  );
  $root.addEventListener(
    TAB_NEXT_EVENT,
    createHandlerFor[TAB_NEXT_EVENT]($tabs, $panels)
  );

  initTabList($tablist);
  $tabs.forEach(initTab);
}

var $roots = [...document.querySelectorAll('[data-tabs-pattern]')];
$roots.forEach(init);
