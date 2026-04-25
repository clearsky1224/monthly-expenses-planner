export const DATA_CHANGE_EVENT = 'app:datachange';

export function emitDataChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
  }
}
