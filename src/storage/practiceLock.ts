export const PRACTICE_BUSY_MESSAGE = 'Đang có lượt luyện ở tab khác. Kết thúc lượt đó rồi thử lại.';

export async function acquirePracticeLock(): Promise<() => Promise<void>> {
  if (!navigator.locks) throw new Error('Trình duyệt chưa hỗ trợ phối hợp các tab. Hãy cập nhật trình duyệt để bắt đầu luyện.');
  return new Promise((resolve, reject) => {
    let unlock: () => void;
    const held = new Promise<void>(release => { unlock = release; });
    const request = navigator.locks.request('nham-nhanh:practice', { ifAvailable: true }, lock => {
      if (!lock) { reject(new Error(PRACTICE_BUSY_MESSAGE)); return; }
      resolve(async () => { unlock(); await request; });
      return held;
    });
    request.catch(reject);
  });
}
