const SHORT_WINDOW_MS = 3 * 60 * 1000;
const FILTER_WINDOW_MS = 2 * 60 * 1000;
const CART_IDLE_MS = 20 * 1000;
const PRODUCT_STAY_MS = 45 * 1000;
const PRE_CART_STAY_MS = 30 * 1000;

function isWithinWindow(timestamp, now, windowMs) {
  return now - timestamp <= windowMs;
}

function getCurrentPageDurationMs(interaction, now) {
  if (!interaction.currentPageEnteredAt) {
    return 0;
  }

  return now - interaction.currentPageEnteredAt;
}

function getRecentEvents(interaction, type, now, windowMs) {
  return interaction.events.filter(
    (event) => event.type === type && isWithinWindow(event.timestamp, now, windowMs),
  );
}

function getRecentProductViewsInCategory(interaction, categoryId, now, windowMs) {
  return interaction.events.filter(
    (event) =>
      event.type === "PRODUCT_VIEW" &&
      event.categoryId === categoryId &&
      isWithinWindow(event.timestamp, now, windowMs),
  );
}

function getRecentFilterChanges(interaction, now) {
  return getRecentEvents(interaction, "FILTER_CHANGE", now, FILTER_WINDOW_MS);
}

function getRecentSupportClicks(interaction, now) {
  return interaction.clicks.filter(
    (click) =>
      isWithinWindow(click.timestamp, now, SHORT_WINDOW_MS) &&
      ["サイズガイド", "素材とお手入れ", "返品・交換", "在庫確認"].includes(click.label),
  );
}

function wasCartAddedForProduct(interaction, productId) {
  return interaction.cartAdds.some((entry) => entry.productId === productId);
}

function getLastCartAdd(interaction) {
  return interaction.cartAdds[interaction.cartAdds.length - 1] ?? null;
}

function getLastInteractionAt(interaction) {
  return interaction.lastInteractionAt ?? 0;
}

function isCurrentProductOutOfStock(context) {
  return context.route.level === "l4" && context.product?.stockStatus === "out_of_stock";
}

export const chatBehaviorRules = [
  {
    id: "compare-multiple-products-same-category",
    type: "open",
    title: "同カテゴリ比較",
    description: "同じカテゴリで複数商品を短時間に見比べたら open",
    shouldTrigger(context) {
      if (!["l3", "l4"].includes(context.route.level)) {
        return false;
      }

      const categoryId = context.route.categoryId ?? context.product?.categoryId;

      if (!categoryId) {
        return false;
      }

      const recentViews = getRecentProductViewsInCategory(
        context.interaction,
        categoryId,
        context.now,
        SHORT_WINDOW_MS,
      );
      const uniqueProductIds = new Set(recentViews.map((view) => view.productId));

      return uniqueProductIds.size >= 3;
    },
    buildPayload() {
      return { message: "比較中の商品違いをご案内できます。気になる点はありますか？" };
    },
  },
  {
    id: "long-stay-on-product-detail",
    type: "open",
    title: "L4長時間滞在",
    description: "商品詳細ページの滞在時間が長いときに open",
    shouldTrigger(context) {
      return (
        context.route.level === "l4" &&
        getCurrentPageDurationMs(context.interaction, context.now) >= PRODUCT_STAY_MS &&
        !wasCartAddedForProduct(context.interaction, context.route.productId)
      );
    },
    buildPayload() {
      return { message: "サイズ感や素材感で迷っていれば、すぐにご案内できます。" };
    },
  },
  {
    id: "open-after-5-l3-l4-transitions",
    type: "open",
    title: "L3/L4往復5回",
    description: "商品一覧と詳細を5回行き来したら open",
    shouldTrigger(context) {
      return context.metrics.l3l4TransitionCount >= 5;
    },
    buildPayload() {
      return { message: "商品選びでお困りですか？" };
    },
  },
  {
    id: "support-info-interest",
    type: "open",
    title: "不安情報の確認",
    description: "サイズ・素材・返品・在庫確認の導線を触ったら open",
    shouldTrigger(context) {
      return context.route.level === "l4" && getRecentSupportClicks(context.interaction, context.now).length >= 1;
    },
    buildPayload() {
      return { message: "サイズ・素材・返品についての不安があればご案内します。" };
    },
  },
  {
    id: "stalled-before-cart",
    type: "open",
    title: "カート前停止",
    description: "商品詳細で迷っている時間が長いときに open",
    shouldTrigger(context) {
      return (
        context.route.level === "l4" &&
        getCurrentPageDurationMs(context.interaction, context.now) >= PRE_CART_STAY_MS &&
        !wasCartAddedForProduct(context.interaction, context.route.productId)
      );
    },
    buildPayload() {
      return { message: "購入前の気になる点があれば、短くご相談いただけます。" };
    },
  },
  {
    id: "stalled-after-cart",
    type: "open",
    title: "カート後停止",
    description: "カート追加後に行動が止まったら open",
    shouldTrigger(context) {
      const lastCartAdd = getLastCartAdd(context.interaction);

      if (!lastCartAdd) {
        return false;
      }

      return context.now - lastCartAdd.timestamp >= CART_IDLE_MS &&
        context.now - getLastInteractionAt(context.interaction) >= CART_IDLE_MS;
    },
    buildPayload() {
      return { message: "配送や次のおすすめ商品についてもご案内できます。" };
    },
  },
  {
    id: "frequent-filter-changes",
    type: "open",
    title: "絞り込み多用",
    description: "L3でフィルタや並び順を頻繁に変えたら open",
    shouldTrigger(context) {
      return context.route.level === "l3" && getRecentFilterChanges(context.interaction, context.now).length >= 4;
    },
    buildPayload() {
      return { message: "条件に合う商品探しをお手伝いできます。お探しの条件はありますか？" };
    },
  },
  {
    id: "stock-or-size-unavailable",
    type: "open",
    title: "在庫・サイズ不足",
    description: "在庫切れやサイズ欠品に遭遇したら open",
    shouldTrigger(context) {
      return (
        isCurrentProductOutOfStock(context) ||
        context.event.type === "SIZE_UNAVAILABLE"
      );
    },
    buildPayload() {
      return { message: "在庫が近い代替商品や近いサイズをご提案できます。" };
    },
  },
  {
    id: "repeat-visit-same-product-group",
    type: "open",
    title: "同カテゴリ再訪",
    description: "同じ商品群を再訪したら open",
    shouldTrigger(context) {
      if (!["l3", "l4"].includes(context.route.level)) {
        return false;
      }

      const categoryId = context.route.categoryId ?? context.product?.categoryId;

      if (!categoryId) {
        return false;
      }

      const categoryPageKey = `category:${categoryId}`;
      return (context.interaction.pageVisits[categoryPageKey] ?? 0) >= 2;
    },
    buildPayload() {
      return { message: "前回から気になっている商品に近いおすすめもご紹介できます。" };
    },
  },
  {
    id: "exit-intent-on-shopping-pages",
    type: "open",
    title: "離脱兆候",
    description: "L3/L4で離脱しそうな動きがあれば open",
    shouldTrigger(context) {
      return (
        context.event.type === "EXIT_INTENT" &&
        ["l3", "l4"].includes(context.route.level)
      );
    },
    buildPayload() {
      return { message: "離れる前に、迷っている点があればすぐお手伝いできます。" };
    },
  },
  {
    id: "close-on-home-return",
    type: "close",
    title: "ホーム復帰で close",
    description: "L1ホームに戻ったら chat を close",
    shouldTrigger(context) {
      return context.route.level === "l1" && context.chat.isOpen;
    },
  },
];

export function createInitialInteractionState() {
  return {
    currentPage: null,
    currentPageEnteredAt: Date.now(),
    currentProductId: null,
    currentCategoryId: null,
    viewedProducts: [],
    pageVisits: {},
    pageDurationsMs: {},
    clicks: [],
    cartAdds: [],
    events: [],
    filterState: {
      color: "all",
      sort: "recommended",
    },
    lastInteractionAt: Date.now(),
    metrics: {
      l3l4TransitionCount: 0,
      totalClicks: 0,
      filterChangeCount: 0,
    },
  };
}

function pushUnique(list, value) {
  return list.includes(value) ? list : [...list, value];
}

export function buildPageKey(route) {
  if (route.level === "l2") {
    return `section:${route.sectionId}`;
  }

  if (route.level === "l3") {
    return `category:${route.categoryId}`;
  }

  if (route.level === "l4") {
    return `product:${route.productId}`;
  }

  return "home";
}

export function recordChatEvent(state, event) {
  const nextState = {
    ...state,
    pageVisits: { ...state.pageVisits },
    pageDurationsMs: { ...state.pageDurationsMs },
    clicks: [...state.clicks],
    cartAdds: [...state.cartAdds],
    events: [...state.events, event].slice(-120),
    metrics: { ...state.metrics },
    viewedProducts: [...state.viewedProducts],
    filterState: { ...state.filterState },
  };

  if (event.type !== "HEARTBEAT") {
    nextState.lastInteractionAt = event.timestamp;
  }

  if (event.type === "PAGE_VIEW") {
    nextState.currentPage = event.pageKey;
    nextState.currentPageEnteredAt = event.timestamp;
    nextState.currentCategoryId = event.categoryId ?? nextState.currentCategoryId;
    nextState.pageVisits[event.pageKey] = (nextState.pageVisits[event.pageKey] ?? 0) + 1;
  }

  if (event.type === "PAGE_LEAVE") {
    nextState.pageDurationsMs[event.pageKey] =
      (nextState.pageDurationsMs[event.pageKey] ?? 0) + event.durationMs;
  }

  if (event.type === "CLICK") {
    nextState.metrics.totalClicks += 1;
    nextState.clicks.push({
      label: event.label,
      pageKey: event.pageKey,
      timestamp: event.timestamp,
    });
    nextState.clicks = nextState.clicks.slice(-50);
  }

  if (event.type === "FILTER_CHANGE") {
    nextState.metrics.filterChangeCount += 1;
    nextState.filterState[event.filterName] = event.value;
  }

  if (event.type === "L3_L4_TRANSITION") {
    nextState.metrics.l3l4TransitionCount += 1;
  }

  if (event.type === "PRODUCT_VIEW") {
    nextState.currentProductId = event.productId;
    nextState.currentCategoryId = event.categoryId ?? nextState.currentCategoryId;
    nextState.viewedProducts = pushUnique(nextState.viewedProducts, event.productId);
  }

  if (event.type === "CART_ADD") {
    nextState.cartAdds.push({
      productId: event.productId,
      timestamp: event.timestamp,
    });
    nextState.cartAdds = nextState.cartAdds.slice(-20);
  }

  return nextState;
}

export function evaluateChatRules({ rules, context, triggeredRuleIds }) {
  return rules.find(
    (rule) => !triggeredRuleIds.has(rule.id) && rule.shouldTrigger(context),
  );
}
