export type Failure =
  | { type: "translation_failed"; message: string }
  | { type: "text_selection_failed"; message: string }
  | { type: "popup_selected"; message: string }
  | { type: "messaging_send_failed"; message: string }
  | { type: "unknown_error"; message: string };
