import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["ko", "en"];

const dictionaries = {
  ko: {
    common: {
      languageToggleLabel: "언어 전환",
      korean: "KO",
      english: "EN",
      unknownAuthor: "작가 미상",
      unknownMaker: "제작자 미상",
      close: "닫기",
      remove: "삭제",
      clear: "비우기",
      search: "검색",
      total: "합계"
    },
    nav: {
      about: "소개",
      goods: "굿즈+어패럴",
      digging: "디깅 존",
      diy: "DIY",
      cart: "카트",
      openMenu: "메뉴 열기",
      closeMenu: "메뉴 닫기",
      primary: "기본 메뉴",
      primaryMobile: "모바일 메뉴"
    },
    status: {
      loadingZines: "진 목록을 불러오는 중...",
      loadingPage: "페이지를 불러오는 중...",
      loadingGoods: "굿즈를 불러오는 중...",
      loadZinesError: "진 목록을 불러오지 못했습니다: {error}",
      loadGoodsError: "굿즈를 불러오지 못했습니다: {error}"
    },
    home: {
      toggleMenu: "메뉴 토글"
    },
    about: {
      body:"각자의 취향과 시선이 담긴 진을 큐레이션하는 서울의 진 스토어취향과 시선이 담긴 진을 큐레이션하는 서울 기반 진 스토어..",
      instagram: "인스타그램"
    },
    catalog: {
      displayMode: "보기 방식",
      scatter: "흩뿌리기",
      grid: "그리드",
      shuffle: "랜덤 진 다시 섞기",
      searchZines: "진 검색",
      searchTitles: "제목 검색",
      clearSearch: "검색 지우기",
      stageLabel: "진 진열",
      empty: "해당 제목과 일치하는 진이 없습니다."
    },
    goods: {
      searchGoods: "굿즈 검색",
      clearSearch: "검색 지우기",
      searchPlaceholder: "검색",
      stageLabel: "굿즈 진열",
      empty: "해당 제목과 일치하는 굿즈가 없습니다."
    },
    goodsDetail: {
      notFound: "굿즈 #{id}를 찾을 수 없습니다.",
      backToGoods: "GOODS로 돌아가기"
    },
    detail: {
      notFound: "진 #{id}를 찾을 수 없습니다.",
      backToDig: "DIG로 돌아가기",
      unavailable: "품절",
      available: "구매 가능",
      savedInCart: "카트에 담김",
      addToCart: "카트에 담기"
    },
    viewer: {
      prev: "이전",
      next: "다음",
      viewerLabel: "{title} 뷰어",
      pageAlt: "{title} {page}페이지"
    },
    cart: {
      continueBrowsing: "계속 둘러보기",
      clearCart: "카트 비우기",
      empty: "카트가 비어 있습니다.",
      goToDig: "DIG로 가기",
      requestTitle: "구매 요청서",
      requestedItems: "요청한 상품",
      submitting: "전송 중...",
      submit: "요청 보내기",
      success: "구매 요청이 전송되었습니다.",
      submitError: "구매 요청을 보내지 못했습니다.",
      endpointMissing: "구매 요청 전송 주소가 아직 설정되지 않았습니다.",
      requestDispatchFailed: "요청을 전송하지 못했습니다.",
      fields: {
        name: "이름",
        note: "한 줄 메모",
        email: "이메일",
        phone: "전화번호",
        address: "주소",
        extraContact: "추가 연락처",
        extraContactPlaceholder: "인스타그램 ID, 카카오톡 ID 등"
      }
    },
    zineMaker: {
      defaultText: "텍스트",
      tools: "진 제작 도구",
      format: "판형",
      orientation: "방향",
      portrait: "세로",
      landscape: "가로",
      pages: "페이지",
      pageCount: "{count} 페이지",
      addPage: "페이지 추가",
      deletePage: "삭제",
      grid: "그리드",
      fold: "접지선",
      stickers: "기본 / 스케치 스티커",
      uploadImage: "이미지 불러오기",
      text: "텍스트",
      addText: "텍스트 추가",
      savePng: "전체 PNG 저장",
      clearPage: "비우기",
      editor: "진 에디터",
      emptyHint: "이미지를 불러오거나 텍스트를 추가해서 진을 만들어봐",
      deleteSticker: "스티커 삭제",
      deleteText: "텍스트 삭제",
      resizeSticker: "{handle} 모서리에서 스티커 크기 조절",
      resizeText: "{handle} 모서리에서 텍스트 크기 조절"
    }
  },
  en: {
    common: {
      languageToggleLabel: "Toggle language",
      korean: "KO",
      english: "EN",
      unknownAuthor: "unknown author",
      unknownMaker: "unknown maker",
      close: "Close",
      remove: "Remove",
      clear: "Clear",
      search: "Search",
      total: "Total"
    },
    nav: {
      about: "About",
      goods: "Goods+Apparel",
      digging: "Digging Zone",
      diy: "DIY",
      cart: "Cart",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      primary: "Primary navigation",
      primaryMobile: "Primary mobile navigation"
    },
    status: {
      loadingZines: "Loading zines...",
      loadingPage: "Loading page...",
      loadingGoods: "Loading goods...",
      loadZinesError: "Could not load zines: {error}",
      loadGoodsError: "Could not load goods: {error}"
    },
    home: {
      toggleMenu: "Toggle menu"
    },
    about: {
      body: "Seoul-based zine store introducing zines shaped by personal tastes",
      instagram: "Instagram"
    },
    catalog: {
      displayMode: "Display mode",
      scatter: "Scatter",
      grid: "Grid",
      shuffle: "Shuffle random zines",
      searchZines: "Search zines",
      searchTitles: "Search titles",
      clearSearch: "Clear search",
      stageLabel: "Zine display",
      empty: "No zines match that title."
    },
    goods: {
      searchGoods: "Search goods",
      clearSearch: "Clear search",
      searchPlaceholder: "Search",
      stageLabel: "Goods display",
      empty: "No goods match that title."
    },
    goodsDetail: {
      notFound: "Could not find goods item #{id}.",
      backToGoods: "Back to GOODS"
    },
    detail: {
      notFound: "Could not find zine #{id}.",
      backToDig: "Back to DIG",
      unavailable: "Unavailable",
      available: "Available",
      savedInCart: "Saved in Cart",
      addToCart: "Add to Cart"
    },
    viewer: {
      prev: "Prev",
      next: "Next",
      viewerLabel: "{title} viewer",
      pageAlt: "{title} page {page}"
    },
    cart: {
      continueBrowsing: "Continue Browsing",
      clearCart: "Clear Cart",
      empty: "Your cart is empty.",
      goToDig: "Go to DIG",
      requestTitle: "Request for Purchase",
      requestedItems: "Requested Items",
      submitting: "Submitting...",
      submit: "Submit Request",
      success: "Purchase request submitted.",
      submitError: "Could not submit request.",
      endpointMissing: "Apps Script endpoint is not configured yet.",
      requestDispatchFailed: "Request could not be sent.",
      fields: {
        name: "Name",
        note: "One-line Note",
        email: "Email",
        phone: "Phone",
        address: "Address",
        extraContact: "Extra Contact",
        extraContactPlaceholder: "Instagram ID, KakaoTalk ID, etc."
      }
    },
    zineMaker: {
      defaultText: "Text",
      tools: "Zine tools",
      format: "Format",
      orientation: "Orientation",
      portrait: "Portrait",
      landscape: "Landscape",
      pages: "Pages",
      pageCount: "{count} page{suffix}",
      addPage: "Add Page",
      deletePage: "Delete",
      grid: "Grid",
      fold: "Fold line",
      stickers: "Default / sketch stickers",
      uploadImage: "Upload Image",
      text: "Text",
      addText: "Add Text",
      savePng: "Save All PNG",
      clearPage: "Clear",
      editor: "Zine editor",
      emptyHint: "Upload an image or add text to start building a zine.",
      deleteSticker: "Delete sticker",
      deleteText: "Delete text",
      resizeSticker: "Resize sticker from {handle} corner",
      resizeText: "Resize text from {handle} corner"
    }
  }
};

function formatTemplate(template, values) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
}

function getDictionaryValue(dictionary, key) {
  return key.split(".").reduce((value, segment) => value?.[segment], dictionary);
}

function detectInitialLanguage() {
  return DEFAULT_LANGUAGE;
}

export function getLocalizedValue(value, language, fallbackLanguage = DEFAULT_LANGUAGE) {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  return (
    value[language] ??
    value[fallbackLanguage] ??
    SUPPORTED_LANGUAGES.map((code) => value[code]).find((entry) => typeof entry === "string") ??
    ""
  );
}

const I18nContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key,
  getLocalized: (value) => value
});

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(detectInitialLanguage);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => {
    const dictionary = dictionaries[language] ?? dictionaries[DEFAULT_LANGUAGE];

    return {
      language,
      setLanguage,
      t(key, params = {}) {
        const entry =
          getDictionaryValue(dictionary, key) ??
          getDictionaryValue(dictionaries[DEFAULT_LANGUAGE], key) ??
          key;

        return typeof entry === "string" ? formatTemplate(entry, params) : entry;
      },
      getLocalized(valueToLocalize) {
        return getLocalizedValue(valueToLocalize, language);
      }
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
