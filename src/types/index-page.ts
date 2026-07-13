export interface Demo {
  name: string;
  description: string;
  image: string;
  url: string;
}

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface IndexData {
  title: string;
  description: string;
  brand: string;
  heading: string;
  subheading: string;
  viewProjectLabel: string;
  navigation?: NavItem[];
  demos: Demo[];
  languageSwitch: {
    label: string;
    url: string;
  };
  footer?: {
    links?: FooterLink[];
    copyright: string;
  };
}
