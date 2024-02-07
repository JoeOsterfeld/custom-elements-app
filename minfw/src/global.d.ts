export {};

declare global {
  interface Window {
    DOMPurify: any;
    Sanitizer: any;
  }

}
