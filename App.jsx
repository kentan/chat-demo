import { useEffect, useRef, useState } from "react";
import {
  buildPageKey,
  chatBehaviorRules,
  createInitialInteractionState,
  evaluateChatRules,
  recordChatEvent,
} from "./chatController";

const catalog = {
  women: {
    id: "women",
    label: "Women",
    headline: "Modern essentials shaped for everyday confidence.",
    description:
      "軽やかな着心地と都会的なシルエットを両立した、ウィメンズの定番ラインです。",
    heroImage:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    categories: [
      {
        id: "women-tops",
        name: "Tシャツ・スウェット",
        description: "デイリーに着回せるトップスと、表情のあるスウェットを揃えました。",
        products: [
          {
            id: "women-airy-logo-tee",
            name: "Airy Logo Tee",
            price: 2990,
            color: "Ivory",
            size: ["XS", "S", "M", "L"],
            material: "コットン100%",
            image:
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
            description:
              "やわらかな天竺素材を使ったクルーネックTシャツ。短めの着丈でボトムとのバランスが取りやすい一枚です。",
          },
          {
            id: "women-cloud-sweat",
            name: "Cloud Sweat Pullover",
            price: 4990,
            color: "Heather Gray",
            size: ["S", "M", "L"],
            material: "本体: 綿82% / ポリエステル18%",
            image:
              "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
            description:
              "ボリューム袖が印象的なスウェットプルオーバー。裏毛素材でロングシーズン活躍します。",
          },
        ],
      },
      {
        id: "women-knit",
        name: "セーター・カーディガン",
        description: "上品な編地と肌あたりの良さにこだわったニットシリーズ。",
        products: [
          {
            id: "women-soft-cardigan",
            name: "Soft Touch Cardigan",
            price: 5990,
            color: "Sand Beige",
            size: ["S", "M", "L"],
            material: "レーヨン50% / ポリエステル30% / ナイロン20%",
            image:
              "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
            description:
              "軽い羽織りとしても一枚着としても使えるVネックカーディガン。落ち感のあるシルエットが特徴です。",
          },
          {
            id: "women-rib-knit",
            name: "Rib Mockneck Sweater",
            price: 5490,
            color: "Deep Navy",
            size: ["S", "M", "L"],
            material: "アクリル45% / 綿35% / ナイロン20%",
            image:
              "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
            description:
              "フィットしすぎないリブ編みで、ジャケットのインナーにも使いやすいモックネックニットです。",
          },
        ],
      },
      {
        id: "women-shirts",
        name: "シャツ・ポロシャツ",
        description: "きちんと感と抜け感を両立したシャツとポロシャツ。",
        products: [
          {
            id: "women-cotton-shirt",
            name: "Crisp Cotton Shirt",
            price: 4990,
            color: "White",
            size: ["S", "M", "L"],
            material: "コットン72% / 再生繊維28%",
            image:
              "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80",
            description:
              "ほどよいオーバーサイズ感で羽織りにも使えるベーシックシャツ。ワードローブの軸になる一着です。",
          },
          {
            id: "women-knit-polo",
            name: "Fine Knit Polo",
            price: 3990,
            color: "Olive",
            size: ["S", "M", "L"],
            material: "綿60% / ポリエステル40%",
            image:
              "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
            description:
              "襟付きできれいめに着られるニットポロ。しなやかな編地でオンオフ兼用しやすい設計です。",
          },
        ],
      },
    ],
  },
  men: {
    id: "men",
    label: "Men",
    headline: "Refined casualwear built for clean, easy layering.",
    description: "機能性と品の良さを両立した、メンズの汎用性の高いラインアップです。",
    heroImage:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    categories: [
      {
        id: "men-tops",
        name: "Tシャツ・スウェット",
        description: "一枚でもレイヤードでも使いやすい、クリーンなカジュアルトップス。",
        products: [
          {
            id: "men-box-tee",
            name: "Box Fit Tee",
            price: 2990,
            color: "Black",
            size: ["S", "M", "L", "XL"],
            material: "コットン100%",
            image:
              "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
            description:
              "肩まわりにゆとりを持たせたボックスシルエット。ハリ感のある生地で一枚でも成立します。",
          },
          {
            id: "men-halfzip-sweat",
            name: "Half Zip Sweat",
            price: 5990,
            color: "Stone",
            size: ["M", "L", "XL"],
            material: "綿76% / ポリエステル24%",
            image:
              "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
            description:
              "首元の開きで印象を変えられるハーフジップ仕様。都会的なミニマルデザインです。",
          },
        ],
      },
      {
        id: "men-knit",
        name: "セーター・カーディガン",
        description: "落ち着いたカラーと着回しやすい編地で構成した定番ニット。",
        products: [
          {
            id: "men-merino-crew",
            name: "Merino Crew Sweater",
            price: 6990,
            color: "Charcoal",
            size: ["M", "L", "XL"],
            material: "メリノウール50% / ナイロン30% / アクリル20%",
            image:
              "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
            description:
              "薄手でも暖かいメリノ混ニット。クルーネックで幅広いコーディネートに対応します。",
          },
          {
            id: "men-button-cardigan",
            name: "Milano Cardigan",
            price: 7490,
            color: "Mocha",
            size: ["M", "L", "XL"],
            material: "ポリエステル52% / 綿28% / ナイロン20%",
            image:
              "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
            description:
              "ミラノリブ特有のきれいな表面感が魅力。軽いアウター感覚で使えるカーディガンです。",
          },
        ],
      },
      {
        id: "men-shirts",
        name: "シャツ・ポロシャツ",
        description: "清潔感のあるシャツと、抜け感を作るポロシャツをセレクト。",
        products: [
          {
            id: "men-oxford-shirt",
            name: "Oxford Relax Shirt",
            price: 4990,
            color: "Blue Stripe",
            size: ["S", "M", "L", "XL"],
            material: "コットン100%",
            image:
              "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80",
            description:
              "ベーシックなオックスフォード生地を、今っぽいリラックスシルエットで仕上げました。",
          },
          {
            id: "men-summer-polo",
            name: "Summer Mesh Polo",
            price: 3990,
            color: "Dusty Green",
            size: ["M", "L", "XL"],
            material: "ポリエステル65% / 綿35%",
            image:
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
            description:
              "通気性のある鹿の子素材を使用。すっきりした前立てで、上品なスポーティ感があります。",
          },
        ],
      },
    ],
  },
  kids: {
    id: "kids",
    label: "KIDS",
    headline: "Play-ready pieces designed for movement and color.",
    description: "毎日の遊びとお出かけの両方にフィットする、元気なキッズコレクションです。",
    heroImage:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=1200&q=80",
    categories: [
      {
        id: "kids-girls",
        name: "GIRLS",
        description: "やさしい色使いと動きやすさを両立したガールズ向けアイテム。",
        products: [
          {
            id: "kids-girls-frill-tee",
            name: "Frill Sleeve Tee",
            price: 1990,
            color: "Peach",
            size: ["110", "120", "130", "140"],
            material: "コットン100%",
            image:
              "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=900&q=80",
            description:
              "袖口のフリルがアクセント。デニムやレギンスと合わせやすいデザインです。",
          },
          {
            id: "kids-girls-knit",
            name: "Ribbon Knit Cardigan",
            price: 2990,
            color: "Lavender",
            size: ["110", "120", "130", "140"],
            material: "アクリル55% / 綿45%",
            image:
              "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
            description:
              "フロントの小さなリボンディテールがポイント。季節の変わり目に便利な一着です。",
          },
        ],
      },
      {
        id: "kids-boys-unisex",
        name: "BOYS・男女兼用",
        description: "丈夫で動きやすい、アクティブな毎日に向けたユニセックスウェア。",
        products: [
          {
            id: "kids-unisex-graphic-tee",
            name: "Graphic Camp Tee",
            price: 1790,
            color: "Off White",
            size: ["100", "110", "120", "130", "140"],
            material: "コットン100%",
            image:
              "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80",
            description:
              "外遊びをイメージしたグラフィックTシャツ。男女問わず取り入れやすい配色です。",
          },
          {
            id: "kids-unisex-hoodie",
            name: "Trail Zip Hoodie",
            price: 3490,
            color: "Navy",
            size: ["110", "120", "130", "140", "150"],
            material: "綿70% / ポリエステル30%",
            image:
              "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
            description:
              "さっと羽織れて着脱しやすいジップフーディ。通園や通学にも便利です。",
          },
        ],
      },
      {
        id: "kids-tops",
        name: "Tシャツ・スウェット",
        description: "キッズ向けの定番トップスをサイズ豊富に展開。",
        products: [
          {
            id: "kids-soft-sweat",
            name: "Soft Play Sweat",
            price: 2490,
            color: "Mint",
            size: ["100", "110", "120", "130", "140"],
            material: "綿78% / ポリエステル22%",
            image:
              "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=900&q=80",
            description:
              "やわらかな裏毛素材を採用し、活発に動いても快適な着心地を保ちます。",
          },
          {
            id: "kids-striped-tee",
            name: "Color Stripe Tee",
            price: 1690,
            color: "Multi",
            size: ["100", "110", "120", "130"],
            material: "コットン100%",
            image:
              "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=900&q=80",
            description:
              "明るい配色のボーダーでコーディネートの主役になるTシャツです。",
          },
        ],
      },
      {
        id: "kids-knit",
        name: "セーター・カーディガン",
        description: "保温性と扱いやすさを両立したキッズニット。",
        products: [
          {
            id: "kids-knit-crew",
            name: "Warm Crew Sweater",
            price: 3290,
            color: "Camel",
            size: ["110", "120", "130", "140"],
            material: "アクリル60% / 綿40%",
            image:
              "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
            description:
              "首元がチクチクしにくい編地設計で、毎日の通園通学にも使いやすいニットです。",
          },
          {
            id: "kids-button-knit",
            name: "Mini Button Cardigan",
            price: 3490,
            color: "Red",
            size: ["100", "110", "120", "130"],
            material: "アクリル58% / 綿42%",
            image:
              "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80",
            description:
              "羽織りとしても主役としても使える、配色が楽しいカーディガンです。",
          },
        ],
      },
    ],
  },
  baby: {
    id: "baby",
    label: "BABY",
    headline: "Gentle, giftable essentials for the earliest seasons.",
    description: "赤ちゃんの肌あたりと着替えやすさを大切にした、やさしいベビーシリーズです。",
    heroImage:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80",
    categories: [
      {
        id: "baby-newborn",
        name: "新生児服・乳児服(0歳から2歳)",
        description: "生まれてすぐから使える、着替えやすいベビーウェア。",
        products: [
          {
            id: "baby-organic-romper",
            name: "Organic Romper Set",
            price: 2990,
            color: "Cream",
            size: ["50", "60", "70", "80"],
            material: "オーガニックコットン100%",
            image:
              "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80",
            description:
              "股下スナップでおむつ替えしやすいロンパースセット。敏感な肌にもやさしい素材です。",
          },
          {
            id: "baby-wrap-body",
            name: "Wrap Body Suit",
            price: 1990,
            color: "Soft Pink",
            size: ["50", "60", "70"],
            material: "コットン100%",
            image:
              "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=900&q=80",
            description:
              "前開き仕様で寝かせたままでも着替えやすい、出産準備に人気の肌着です。",
          },
        ],
      },
      {
        id: "baby-infant",
        name: "乳児服(6ヶ月から5歳)",
        description: "ハイハイ期から幼児期まで、動きやすさを重視したアイテム。",
        products: [
          {
            id: "baby-playwear-set",
            name: "Playwear Setup",
            price: 3490,
            color: "Sky Blue",
            size: ["80", "90", "100", "110"],
            material: "綿68% / ポリエステル32%",
            image:
              "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80",
            description:
              "上下セットでコーディネートが完成。伸縮性があり、よく動く時期にも快適です。",
          },
          {
            id: "baby-gauze-shirt",
            name: "Double Gauze Shirt",
            price: 2490,
            color: "Sage",
            size: ["80", "90", "100"],
            material: "コットン100%",
            image:
              "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=900&q=80",
            description:
              "通気性の良いダブルガーゼを採用したシャツ。軽い羽織りとしても便利です。",
          },
        ],
      },
      {
        id: "baby-leggings",
        name: "レギンス・パンツ",
        description: "毎日洗えて動きやすい、ベビー向けボトムス。",
        products: [
          {
            id: "baby-rib-leggings",
            name: "Rib Leggings 2-Pack",
            price: 1990,
            color: "Ecru / Gray",
            size: ["70", "80", "90", "100"],
            material: "綿95% / ポリウレタン5%",
            image:
              "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
            description:
              "伸びが良く、お着替えしやすいリブレギンス。洗い替えに便利な2枚組です。",
          },
          {
            id: "baby-easy-pants",
            name: "Easy Tapered Pants",
            price: 2290,
            color: "Khaki",
            size: ["80", "90", "100"],
            material: "綿70% / ナイロン30%",
            image:
              "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
            description:
              "膝まわりにゆとりを持たせたテーパードパンツ。やわらかなウエストゴムで快適です。",
          },
        ],
      },
      {
        id: "baby-gift",
        name: "出産準備・出産祝い",
        description: "ギフトとしても選びやすい、実用性の高いベビーアイテム。",
        products: [
          {
            id: "baby-gift-box",
            name: "Welcome Baby Gift Box",
            price: 4990,
            color: "Natural",
            size: ["One Size"],
            material: "スタイ: 綿100% / ブランケット: 綿100%",
            image:
              "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=900&q=80",
            description:
              "スタイ、ブランケット、ラトルが入ったギフトセット。出産祝いの定番として人気です。",
          },
          {
            id: "baby-prep-set",
            name: "Newborn Prep Set",
            price: 3990,
            color: "Ivory",
            size: ["50-70"],
            material: "コットン100%",
            image:
              "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80",
            description:
              "肌着、ミトン、帽子をまとめた出産準備セット。初めての準備にも選びやすい内容です。",
          },
        ],
      },
    ],
  },
};

const topSections = Object.values(catalog);
const shippingBenefits = [
  "11,000円以上で送料無料",
  "最短翌日配送",
  "サイズ交換1回無料",
];

function formatPrice(price) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function buildCategoryIndex() {
  return topSections.flatMap((section) =>
    section.categories.map((category) => ({
      ...category,
      sectionId: section.id,
      sectionLabel: section.label,
      sectionHeadline: section.headline,
      sectionDescription: section.description,
      sectionImage: section.heroImage,
    })),
  );
}

const categoryIndex = buildCategoryIndex();
const inventoryOverrides = {
  "women-airy-logo-tee": {
    availableSizes: ["S", "M", "L"],
    unavailableSizes: ["XS"],
    stockStatus: "in_stock",
  },
  "men-halfzip-sweat": {
    availableSizes: ["M", "L"],
    unavailableSizes: ["XL"],
    stockStatus: "low_stock",
  },
  "kids-striped-tee": {
    availableSizes: ["100", "110"],
    unavailableSizes: ["120", "130"],
    stockStatus: "low_stock",
  },
  "baby-gift-box": {
    availableSizes: [],
    unavailableSizes: ["One Size"],
    stockStatus: "out_of_stock",
  },
};

const productIndex = categoryIndex.flatMap((category) =>
  category.products.map((product) => ({
    ...product,
    sectionId: category.sectionId,
    sectionLabel: category.sectionLabel,
    categoryId: category.id,
    categoryName: category.name,
    availableSizes:
      inventoryOverrides[product.id]?.availableSizes ?? product.size,
    unavailableSizes: inventoryOverrides[product.id]?.unavailableSizes ?? [],
    stockStatus: inventoryOverrides[product.id]?.stockStatus ?? "in_stock",
  })),
);

const productLookup = Object.fromEntries(productIndex.map((product) => [product.id, product]));

function parseHash(hashValue) {
  const hash = hashValue.replace(/^#/, "");

  if (!hash) {
    return { level: "l1" };
  }

  const segments = hash.split("/").filter(Boolean);

  if (segments[0] === "section" && segments[1]) {
    return { level: "l2", sectionId: segments[1] };
  }

  if (segments[0] === "category" && segments[1]) {
    return { level: "l3", categoryId: segments[1] };
  }

  if (segments[0] === "product" && segments[1]) {
    return { level: "l4", productId: segments[1] };
  }

  return { level: "l1" };
}

function navigateTo(hash) {
  window.location.hash = hash;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function isTrackedL3L4Transition(previousLevel, currentLevel) {
  return (
    (previousLevel === "l3" && currentLevel === "l4") ||
    (previousLevel === "l4" && currentLevel === "l3")
  );
}

function getClickLabel(target) {
  const clickable = target.closest("button, a, [data-track-click]");

  if (!clickable) {
    return null;
  }

  const explicitLabel = clickable.getAttribute("data-track-click");

  if (explicitLabel) {
    return explicitLabel;
  }

  return clickable.textContent?.trim().slice(0, 80) || null;
}

function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      {items.map((item) =>
        item.href ? (
          <button key={item.label} className="crumb-link" onClick={() => navigateTo(item.href)}>
            {item.label}
          </button>
        ) : (
          <span key={item.label} className="crumb-current">
            {item.label}
          </span>
        ),
      )}
    </nav>
  );
}

function Header() {
  return (
    <header className="site-header">
      <button className="brand-mark" onClick={() => navigateTo("")}>
        <span className="brand-kicker">APPAREL SELECT</span>
        <strong>Northline Atelier</strong>
      </button>

      <nav className="top-nav" aria-label="global navigation">
        {topSections.map((section) => (
          <button
            key={section.id}
            className="nav-link"
            onClick={() => navigateTo(`section/${section.id}`)}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

function HeroHome() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">L1 Category Gateway</p>
        <h1>世代ごとのカテゴリから選べる、アパレルECサイト。</h1>
        <p className="hero-text">
          Women / Men / KIDS / BABY の4つを起点に、L2カテゴリ、L3商品一覧、L4商品詳細へ自然に遷移できる構成です。
        </p>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => navigateTo("section/women")}>
            Womenを見る
          </button>
          <button className="secondary-button" onClick={() => navigateTo("section/baby")}>
            BABYを見る
          </button>
        </div>
      </div>

      <div className="hero-panel">
        <p className="eyebrow">Service</p>
        <ul className="benefit-list">
          {shippingBenefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <p className="hero-note">
          各商品詳細ページには価格、素材、サイズ、購入ボタンを配置し、L4ページとして成立する導線にしています。
        </p>
      </div>
    </section>
  );
}

function SectionGrid() {
  return (
    <section className="section-grid">
      {topSections.map((section) => (
        <article key={section.id} className="section-card">
          <img src={section.heroImage} alt={section.label} className="section-image" />
          <div className="section-card-body">
            <p className="eyebrow">{section.label}</p>
            <h2>{section.headline}</h2>
            <p>{section.description}</p>
            <button className="primary-button" onClick={() => navigateTo(`section/${section.id}`)}>
              {section.label}のカテゴリへ
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

function SectionPage({ section }) {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "" }, { label: section.label }]} />
      <section className="detail-hero">
        <img src={section.heroImage} alt={section.label} className="detail-hero-image" />
        <div className="detail-hero-copy">
          <p className="eyebrow">L2 Page</p>
          <h1>{section.label}</h1>
          <p>{section.description}</p>
        </div>
      </section>

      <section className="category-grid">
        {section.categories.map((category) => (
          <article key={category.id} className="category-card">
            <p className="eyebrow">{section.label}</p>
            <h2>{category.name}</h2>
            <p>{category.description}</p>
            <div className="category-meta">{category.products.length} items</div>
            <button
              className="primary-button"
              onClick={() => navigateTo(`category/${category.id}`)}
            >
              商品一覧を見る
            </button>
          </article>
        ))}
      </section>
    </>
  );
}

function CategoryPage({
  category,
  products,
  selectedColor,
  selectedSort,
  onColorChange,
  onSortChange,
}) {
  const availableColors = ["all", ...new Set(category.products.map((product) => product.color))];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "" },
          { label: category.sectionLabel, href: `section/${category.sectionId}` },
          { label: category.name },
        ]}
      />

      <section className="listing-header">
        <div>
          <p className="eyebrow">L3 Page</p>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
        </div>
        <div className="listing-summary">
          <strong>{products.length}</strong>
          <span>products</span>
        </div>
      </section>

      <section className="listing-tools">
        <div className="filter-pills">
          {availableColors.map((color) => (
            <button
              key={color}
              className={`filter-pill ${selectedColor === color ? "filter-pill-active" : ""}`}
              onClick={() => onColorChange(color)}
              data-track-click={`color-filter:${color}`}
            >
              {color === "all" ? "すべて" : color}
            </button>
          ))}
        </div>

        <label className="sort-select">
          <span>並び順</span>
          <select
            value={selectedSort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <option value="recommended">おすすめ順</option>
            <option value="price-low">価格が低い順</option>
            <option value="price-high">価格が高い順</option>
          </select>
        </label>
      </section>

      <section className="product-grid">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="product-card-body">
              <p className="eyebrow">{category.sectionLabel}</p>
              <h2>{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <p className={`stock-badge stock-${product.stockStatus}`}>
                {product.stockStatus === "out_of_stock"
                  ? "在庫切れ"
                  : product.stockStatus === "low_stock"
                    ? "在庫わずか"
                    : "在庫あり"}
              </p>
              <div className="product-meta">
                <span>{product.color}</span>
                <span>{product.size.join(" / ")}</span>
              </div>
              <div className="product-card-footer">
                <strong>¥{formatPrice(product.price)}</strong>
                <button
                  className="primary-button"
                  onClick={() => navigateTo(`product/${product.id}`)}
                >
                  詳細を見る
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function ProductPage({ product, selectedSize, onSelectSize, onAddToCart }) {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "" },
          { label: product.sectionLabel, href: `section/${product.sectionId}` },
          { label: product.categoryName, href: `category/${product.categoryId}` },
          { label: product.name },
        ]}
      />

      <section className="product-detail">
        <img src={product.image} alt={product.name} className="product-detail-image" />

        <div className="product-detail-copy">
          <p className="eyebrow">L4 Page</p>
          <h1>{product.name}</h1>
          <p className="product-price">¥{formatPrice(product.price)}</p>
          <p className="product-detail-description">{product.description}</p>

          <div className="stock-line">
            <span className={`stock-badge stock-${product.stockStatus}`}>
              {product.stockStatus === "out_of_stock"
                ? "現在在庫切れ"
                : product.stockStatus === "low_stock"
                  ? "在庫わずか"
                  : "在庫あり"}
            </span>
          </div>

          <dl className="spec-list">
            <div>
              <dt>カテゴリ</dt>
              <dd>{product.categoryName}</dd>
            </div>
            <div>
              <dt>カラー</dt>
              <dd>{product.color}</dd>
            </div>
            <div>
              <dt>サイズ</dt>
              <dd>{product.size.join(", ")}</dd>
            </div>
            <div>
              <dt>素材</dt>
              <dd>{product.material}</dd>
            </div>
          </dl>

          <div className="size-picker">
            <strong>サイズを選ぶ</strong>
            <div className="size-grid">
              {product.size.map((size) => {
                const isAvailable = product.availableSizes.includes(size);
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    className={`size-chip ${isSelected ? "size-chip-selected" : ""} ${
                      !isAvailable ? "size-chip-disabled" : ""
                    }`}
                    onClick={() => onSelectSize(size, isAvailable)}
                    data-track-click={isAvailable ? `size:${size}` : `size-unavailable:${size}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="support-links">
            <button className="secondary-button" data-track-click="サイズガイド">
              サイズガイド
            </button>
            <button className="secondary-button" data-track-click="素材とお手入れ">
              素材とお手入れ
            </button>
            <button className="secondary-button" data-track-click="返品・交換">
              返品・交換
            </button>
            <button className="secondary-button" data-track-click="在庫確認">
              在庫確認
            </button>
          </div>

          <div className="cta-panel">
            <button
              className="primary-button large-button"
              onClick={onAddToCart}
              disabled={product.stockStatus === "out_of_stock"}
              data-track-click="カートに入れる"
            >
              カートに入れる
            </button>
            <button className="secondary-button">お気に入りに追加</button>
          </div>

          <div className="purchase-note">
            <strong>購入への導線</strong>
            <p>サイズ確認からカート投入まで、このページで完結できる構成にしています。</p>
          </div>
        </div>
      </section>
    </>
  );
}

function NotFound() {
  return (
    <section className="empty-state">
      <p className="eyebrow">Not Found</p>
      <h1>ページが見つかりませんでした。</h1>
      <button className="primary-button" onClick={() => navigateTo("")}>
        ホームへ戻る
      </button>
    </section>
  );
}

function ChatBot({ isOpen, onToggle, message }) {
  return (
    <aside className={`chatbot ${isOpen ? "chatbot-open" : ""}`} aria-live="polite">
      <div className="chatbot-window">
        <div className="chatbot-header">
          <div>
            <p className="eyebrow">Support Chat</p>
            <strong>Northline Concierge</strong>
          </div>
          <button className="chatbot-close" onClick={onToggle} aria-label="チャットを閉じる">
            ×
          </button>
        </div>

        <div className="chatbot-body">
          <div className="chatbot-message">
            <p>{message}</p>
          </div>
          <div className="chatbot-actions">
            <button className="secondary-button">サイズ相談</button>
            <button className="secondary-button">おすすめを聞く</button>
          </div>
        </div>
      </div>

      <button className="chatbot-trigger" onClick={onToggle} aria-expanded={isOpen}>
        <span className="chatbot-trigger-label">チャット</span>
        <strong>ご相談はこちら</strong>
      </button>
    </aside>
  );
}

function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState(
    "気になる商品があれば、サイズ感やおすすめカテゴリをご案内します。",
  );
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [selectedSize, setSelectedSize] = useState("");
  const interactionStateRef = useRef(createInitialInteractionState());
  const triggeredRuleIdsRef = useRef(new Set());
  const previousLevelRef = useRef(route.level);
  const currentPageKeyRef = useRef(buildPageKey(route));
  const currentRouteRef = useRef(route);
  const currentChatStateRef = useRef({
    isOpen: false,
    message: "気になる商品があれば、サイズ感やおすすめカテゴリをご案内します。",
  });

  function emitEvent(event) {
    interactionStateRef.current = recordChatEvent(interactionStateRef.current, event);
    const currentProduct =
      currentRouteRef.current.level === "l4"
        ? productLookup[currentRouteRef.current.productId]
        : null;

    const matchedRule = evaluateChatRules({
      rules: chatBehaviorRules,
      context: {
        route: currentRouteRef.current,
        event,
        metrics: interactionStateRef.current.metrics,
        interaction: interactionStateRef.current,
        chat: currentChatStateRef.current,
        product: currentProduct,
        now: event.timestamp,
      },
      triggeredRuleIds: triggeredRuleIdsRef.current,
    });

    if (!matchedRule) {
      return;
    }

    triggeredRuleIdsRef.current.add(matchedRule.id);

    if (matchedRule.type === "open") {
      const payload = matchedRule.buildPayload?.({
        route: currentRouteRef.current,
        event,
        metrics: interactionStateRef.current.metrics,
        interaction: interactionStateRef.current,
        product: currentProduct,
        now: event.timestamp,
      });

      if (payload?.message) {
        setChatMessage(payload.message);
      }

      setIsChatOpen(true);
    }

    if (matchedRule.type === "close") {
      setIsChatOpen(false);
    }
  }

  function handleFilterChange(filterName, value) {
    if (filterName === "color") {
      setSelectedColor(value);
    }

    if (filterName === "sort") {
      setSelectedSort(value);
    }

    emitEvent({
      type: "FILTER_CHANGE",
      filterName,
      value,
      pageKey: currentPageKeyRef.current,
      timestamp: Date.now(),
    });
  }

  function handleSelectSize(product, size, isAvailable) {
    setSelectedSize(size);

    emitEvent({
      type: isAvailable ? "SIZE_SELECT" : "SIZE_UNAVAILABLE",
      productId: product.id,
      size,
      pageKey: currentPageKeyRef.current,
      timestamp: Date.now(),
    });
  }

  function handleAddToCart(product) {
    emitEvent({
      type: "CART_ADD",
      productId: product.id,
      pageKey: currentPageKeyRef.current,
      timestamp: Date.now(),
    });
  }

  useEffect(() => {
    currentRouteRef.current = route;
  }, [route]);

  useEffect(() => {
    currentChatStateRef.current = {
      isOpen: isChatOpen,
      message: chatMessage,
    };
  }, [isChatOpen, chatMessage]);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };

    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  useEffect(() => {
    setSelectedColor("all");
    setSelectedSort("recommended");
    setSelectedSize("");
  }, [route.level, route.categoryId, route.productId]);

  useEffect(() => {
    const onClick = (event) => {
      const label = getClickLabel(event.target);

      if (!label) {
        return;
      }

      emitEvent({
        type: "CLICK",
        label,
        pageKey: currentPageKeyRef.current,
        timestamp: Date.now(),
      });
    };

    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        emitEvent({
          type: "EXIT_INTENT",
          reason: "visibility-hidden",
          pageKey: currentPageKeyRef.current,
          timestamp: Date.now(),
        });
      }
    };

    const onMouseOut = (event) => {
      if (event.relatedTarget === null && event.clientY <= 0) {
        emitEvent({
          type: "EXIT_INTENT",
          reason: "mouse-top-leave",
          pageKey: currentPageKeyRef.current,
          timestamp: Date.now(),
        });
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  useEffect(() => {
    const pageKey = buildPageKey(route);
    const now = Date.now();
    const previousPageKey = currentPageKeyRef.current;

    if (interactionStateRef.current.currentPage === null) {
      emitEvent({
        type: "PAGE_VIEW",
        pageKey,
        categoryId: route.categoryId,
        timestamp: now,
      });

      currentPageKeyRef.current = pageKey;

      if (route.level === "l4" && route.productId) {
        emitEvent({
          type: "PRODUCT_VIEW",
          productId: route.productId,
          timestamp: now,
        });
      }

      previousLevelRef.current = route.level;
      return;
    }

    if (previousPageKey !== pageKey) {
      const enteredAt = interactionStateRef.current.currentPageEnteredAt;

      emitEvent({
        type: "PAGE_LEAVE",
        pageKey: previousPageKey,
        durationMs: now - enteredAt,
        timestamp: now,
      });

      emitEvent({
        type: "PAGE_VIEW",
        pageKey,
        categoryId: route.categoryId,
        timestamp: now,
      });
    }

    const previousLevel = previousLevelRef.current;
    const currentLevel = route.level;

    if (isTrackedL3L4Transition(previousLevel, currentLevel)) {
      emitEvent({
        type: "L3_L4_TRANSITION",
        previousLevel,
        currentLevel,
        timestamp: now,
      });
    }

    if (route.level === "l4" && route.productId) {
      emitEvent({
        type: "PRODUCT_VIEW",
        productId: route.productId,
        categoryId: productLookup[route.productId]?.categoryId,
        timestamp: now,
      });
    }

    currentPageKeyRef.current = pageKey;
    previousLevelRef.current = currentLevel;
  }, [route]);

  useEffect(() => {
    const heartbeat = window.setInterval(() => {
      if (!interactionStateRef.current.currentPage) {
        return;
      }

      emitEvent({
        type: "HEARTBEAT",
        pageKey: currentPageKeyRef.current,
        timestamp: Date.now(),
      });
    }, 5000);

    return () => {
      window.clearInterval(heartbeat);
    };
  }, []);

  useEffect(() => {
    const onBeforeUnload = () => {
      const now = Date.now();
      const currentPage = interactionStateRef.current.currentPage;

      if (!currentPage) {
        return;
      }

      interactionStateRef.current = recordChatEvent(interactionStateRef.current, {
        type: "PAGE_LEAVE",
        pageKey: currentPage,
        durationMs: now - interactionStateRef.current.currentPageEnteredAt,
        timestamp: now,
      });
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  let content = (
    <>
      <HeroHome />
      <SectionGrid />
    </>
  );

  if (route.level === "l2") {
    const section = catalog[route.sectionId];
    content = section ? <SectionPage section={section} /> : <NotFound />;
  }

  if (route.level === "l3") {
    const category = categoryIndex.find((entry) => entry.id === route.categoryId);
    const products = category
      ? category.products
          .map((product) => productLookup[product.id] ?? product)
          .filter((product) => selectedColor === "all" || product.color === selectedColor)
          .sort((left, right) => {
            if (selectedSort === "price-low") {
              return left.price - right.price;
            }

            if (selectedSort === "price-high") {
              return right.price - left.price;
            }

            return 0;
          })
      : [];

    content = category ? (
      <CategoryPage
        category={category}
        products={products}
        selectedColor={selectedColor}
        selectedSort={selectedSort}
        onColorChange={(value) => handleFilterChange("color", value)}
        onSortChange={(value) => handleFilterChange("sort", value)}
      />
    ) : (
      <NotFound />
    );
  }

  if (route.level === "l4") {
    const product = productIndex.find((entry) => entry.id === route.productId);
    content = product ? (
      <ProductPage
        product={product}
        selectedSize={selectedSize}
        onSelectSize={(size, isAvailable) => handleSelectSize(product, size, isAvailable)}
        onAddToCart={() => handleAddToCart(product)}
      />
    ) : (
      <NotFound />
    );
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="page-shell">{content}</main>
      <ChatBot
        isOpen={isChatOpen}
        onToggle={() => {
          setIsChatOpen((current) => !current);
        }}
        message={chatMessage}
      />
    </div>
  );
}

export default App;
