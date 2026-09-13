/**
 * Natural Vietnamese phrasings for life-application questions (Money, Time, Calendar).
 * Each family has at least 3 approved distinct templates.
 */

export interface PromptTemplate {
  render: (...args: any[]) => string;
}

// Money & Shopping Templates (P01 - P10)
export const MONEY_TEMPLATES = {
  P01: [
    (item1: string, p1: string, item2: string, p2: string) =>
      `Mua ${item1} giá ${p1} và ${item2} giá ${p2}. Tổng cộng hết bao nhiêu đồng?`,
    (item1: string, p1: string, item2: string, p2: string) =>
      `Một hóa đơn gồm ${item1} (${p1}) cùng một phần ${item2} (${p2}). Số tiền cần thanh toán là bao nhiêu?`,
    (item1: string, p1: string, item2: string, p2: string) =>
      `Tính tổng số tiền khi mua cả ${item1} giá ${p1} và ${item2} giá ${p2}:`
  ],
  P02: [
    (bill: string, paid: string) =>
      `Hóa đơn hết ${bill}, khách đưa ${paid}. Người bán cần trả lại bao nhiêu đồng?`,
    (bill: string, paid: string) =>
      `Mua hàng trị giá ${bill} và thanh toán bằng tờ ${paid}. Tiền thừa nhận lại là bao nhiêu?`,
    (bill: string, paid: string) =>
      `Tổng tiền là ${bill}. Sau khi trả ${paid}, còn nhận lại bao nhiêu tiền thừa?`
  ],
  P03: [
    (q: number, item: string, unitPrice: string) =>
      `Mua ${q} ${item}, mỗi món có giá ${unitPrice}. Tổng số tiền phải trả là bao nhiêu?`,
    (q: number, item: string, unitPrice: string) =>
      `Một người chọn ${q} ${item} với đơn giá ${unitPrice}/${item}. Hết tất cả bao nhiêu đồng?`,
    (q: number, item: string, unitPrice: string) =>
      `Giá mỗi ${item} là ${unitPrice}. Mua ${q} ${item} như vậy hết bao nhiêu đồng?`
  ],
  P04: [
    (q1: number, item1: string, p1: string, q2: number, item2: string, p2: string) =>
      `Giỏ hàng gồm ${q1} ${item1} (giá ${p1}/${item1}) và ${q2} ${item2} (giá ${p2}/${item2}). Tổng tiền là bao nhiêu?`,
    (q1: number, item1: string, p1: string, q2: number, item2: string, p2: string) =>
      `Mua ${q1} ${item1} đơn giá ${p1} cùng ${q2} ${item2} đơn giá ${p2}. Cần thanh toán tất cả bao nhiêu đồng?`,
    (q1: number, item1: string, p1: string, q2: number, item2: string, p2: string) =>
      `Tính tiền cho đơn hàng có ${q1} ${item1} (${p1}/${item1}) và ${q2} ${item2} (${p2}/${item2}):`
  ],
  P05: [
    (total: string, n: number) =>
      `Nhóm bạn ăn uống hết ${total}, chia đều cho ${n} người. Mỗi người cần góp bao nhiêu đồng?`,
    (total: string, n: number) =>
      `Hóa đơn ${total} được chia tiền bằng nhau cho ${n} bạn. Mỗi bạn phải trả bao nhiêu?`,
    (total: string, n: number) =>
      `Có tổng cộng ${total}, đem chia đều cho ${n} phần. Mỗi phần là bao nhiêu đồng?`
  ],
  P06: [
    (budget: string, unitPrice: string, item: string) =>
      `Có ${budget}, mỗi ${item} giá ${unitPrice}. Mua được tối đa bao nhiêu ${item}?`,
    (budget: string, unitPrice: string, item: string) =>
      `Với số tiền ${budget} và giá mỗi ${item} là ${unitPrice}, có thể mua nhiều nhất bao nhiêu cái?`,
    (budget: string, unitPrice: string, item: string) =>
      `Mỗi ${item} có giá ${unitPrice}. Mang theo ${budget} thì mua đủ tối đa bao nhiêu ${item}?`
  ],
  P07: [
    (budget: string, unitPrice: string, item: string) =>
      `Có ${budget}, mua tối đa số ${item} giá ${unitPrice}/${item}. Còn dư lại bao nhiêu đồng?`,
    (budget: string, unitPrice: string, item: string) =>
      `Sau khi dùng ${budget} để mua nhiều ${item} nhất có thể (giá ${unitPrice}/${item}), số tiền còn lại là bao nhiêu?`,
    (budget: string, unitPrice: string, item: string) =>
      `Mang ${budget} đi mua ${item} (${unitPrice}/${item}), sau khi mua được số lượng tối đa thì còn thừa bao nhiêu đồng?`
  ],
  P08: [
    (daily: string, days: number, initial: string) =>
      `Đang có sẵn ${initial}. Mỗi ngày tiết kiệm thêm ${daily} trong ${days} ngày. Sau ${days} ngày có tất cả bao nhiêu đồng?`,
    (daily: string, days: number, initial: string) =>
      `Bạn để dành ${daily} mỗi ngày liên tục ${days} ngày, cộng với khoản ${initial} có từ trước. Tổng tiền tích lũy được là bao nhiêu?`,
    (daily: string, days: number, initial: string) =>
      `Sau ${days} ngày bỏ heo ${daily}/ngày và có số dư ban đầu ${initial}, bạn sẽ tích lũy được bao nhiêu đồng?`
  ],
  P09: [
    (original: string, discount: string) =>
      `Món hàng giá gốc ${original}, được giảm trực tiếp ${discount}. Giá phải trả sau khi giảm là bao nhiêu?`,
    (original: string, discount: string) =>
      `Sản phẩm niêm yết ${original}, cửa hàng có phiếu giảm giá ${discount}. Bạn cần trả bao nhiêu đồng?`,
    (original: string, discount: string) =>
      `Hóa đơn ${original} được trừ ngay ưu đãi ${discount}. Số tiền thanh toán thực tế là bao nhiêu?`
  ],
  P10: [
    (original: string, percent: number) =>
      `Áo có giá gốc ${original}, đang được giảm ${percent}%. Giá sau khi giảm là bao nhiêu đồng?`,
    (original: string, percent: number) =>
      `Sản phẩm giá ${original} khuyến mãi giảm ${percent}%. Khách hàng cần trả bao nhiêu tiền?`,
    (original: string, percent: number) =>
      `Một món đồ giá ${original} được giảm ${percent}%. Tính giá bán sau khi áp dụng giảm giá:`
  ]
};

// Time Templates (T01 - T08)
export const TIME_TEMPLATES = {
  T01: {
    hoursToMinutes: [
      (h: number) => `${h} giờ bằng bao nhiêu phút?`,
      (h: number) => `Đổi ${h} giờ sang đơn vị phút:`,
      (h: number) => `Khoảng thời gian kéo dài ${h} giờ tương đương với bao nhiêu phút?`
    ],
    minutesToHours: [
      (m: number) => `${m} phút bằng bao nhiêu giờ?`,
      (m: number) => `Đổi ${m} phút sang đơn vị giờ:`,
      (m: number) => `Một khoảng thời gian dài ${m} phút tương đương với bao nhiêu giờ?`
    ]
  },
  T02: {
    minutesToSeconds: [
      (m: number) => `${m} phút bằng bao nhiêu giây?`,
      (m: number) => `Đổi ${m} phút ra số giây:`,
      (m: number) => `Thời lượng ${m} phút tương ứng với bao nhiêu giây?`
    ],
    secondsToMinutes: [
      (s: number) => `${s} giây bằng bao nhiêu phút?`,
      (s: number) => `Đổi ${s} giây ra đơn vị phút:`,
      (s: number) => `Đồng hồ bấm giờ chỉ ${s} giây, tức là bao nhiêu phút?`
    ]
  },
  T03: [
    (h: number, m1: number, m2: number) =>
      `Từ ${String(h).padStart(2, '0')}:${String(m1).padStart(2, '0')} đến ${String(h).padStart(2, '0')}:${String(m2).padStart(2, '0')} cùng ngày là bao nhiêu phút?`,
    (h: number, m1: number, m2: number) =>
      `Một trận đấu bắt đầu lúc ${String(h).padStart(2, '0')}:${String(m1).padStart(2, '0')} và kết thúc lúc ${String(h).padStart(2, '0')}:${String(m2).padStart(2, '0')}. Trận đấu kéo dài bao nhiêu phút?`,
    (h: number, m1: number, m2: number) =>
      `Khoảng cách thời gian giữa ${String(h).padStart(2, '0')}:${String(m1).padStart(2, '0')} và ${String(h).padStart(2, '0')}:${String(m2).padStart(2, '0')} là bao nhiêu phút?`
  ],
  T04: [
    (t1: string, t2: string) =>
      `Từ ${t1} đến ${t2} trong cùng một ngày cách nhau bao nhiêu phút?`,
    (t1: string, t2: string) =>
      `Buổi học bắt đầu lúc ${t1} và kết thúc lúc ${t2} cùng ngày. Buổi học kéo dài bao nhiêu phút?`,
    (t1: string, t2: string) =>
      `Tính số phút chênh lệch giữa hai mốc thời gian ${t1} và ${t2} (trong cùng ngày):`
  ],
  T05: [
    (start: string, duration: number) =>
      `Bắt đầu lúc ${start}, diễn ra trong ${duration} phút (cùng ngày). Kết thúc lúc mấy giờ?`,
    (start: string, duration: number) =>
      `Một chuyến xe xuất phát lúc ${start} và chạy mất ${duration} phút. Xe đến nơi lúc mấy giờ?`,
    (start: string, duration: number) =>
      `Đồng hồ điểm ${start}. Sau đó đúng ${duration} phút sẽ là mấy giờ mấy phút?`
  ],
  T06: [
    (start: string, duration: number) =>
      `Bắt đầu lúc ${start} đêm hôm trước, kéo dài ${duration} phút sang ngày hôm sau. Kết thúc lúc mấy giờ?`,
    (start: string, duration: number) =>
      `Chuyến tàu khởi hành lúc ${start}, chạy xuyên đêm mất ${duration} phút. Tàu tới ga vào mấy giờ sáng hôm sau?`,
    (start: string, duration: number) =>
      `Sự kiện bắt đầu lúc ${start} và diễn ra trong ${duration} phút qua nửa đêm. Thời điểm kết thúc là mấy giờ?`
  ],
  T07: [
    (rounds: number, roundMin: number, breakCount: number, breakMin: number) =>
      `Có ${rounds} hiệp đấu, mỗi hiệp ${roundMin} phút; giữa các hiệp có ${breakCount} khoảng nghỉ, mỗi lần nghỉ ${breakMin} phút. Tổng thời gian là bao nhiêu phút?`,
    (rounds: number, roundMin: number, breakCount: number, breakMin: number) =>
      `Tập luyện ${rounds} lượt, mỗi lượt kéo dài ${roundMin} phút. Nghỉ giải lao ${breakCount} lần, mỗi lần ${breakMin} phút. Toàn bộ buổi tập mất bao nhiêu phút?`,
    (rounds: number, roundMin: number, breakCount: number, breakMin: number) =>
      `Một buổi hội thảo gồm ${rounds} phiên thảo luận (${roundMin} phút/phiên) và ${breakCount} giờ nghỉ giải lao (${breakMin} phút/lần). Tổng thời gian tất cả là bao nhiêu phút?`
  ],
  T08: [
    (target: string, travelMin: number, bufferMin: number) =>
      `Cần có mặt lúc ${target}. Thời gian đi đường là ${travelMin} phút và muốn đến sớm ${bufferMin} phút. Cần khởi hành lúc mấy giờ?`,
    (target: string, travelMin: number, bufferMin: number) =>
      `Cuộc hẹn diễn ra lúc ${target}. Đi xe mất ${travelMin} phút và cần chuẩn bị/đến sớm ${bufferMin} phút. Bạn phải xuất phát lúc mấy giờ?`,
    (target: string, travelMin: number, bufferMin: number) =>
      `Để kịp giờ hẹn ${target}, biết phải đi mất ${travelMin} phút và trừ hao đến sớm ${bufferMin} phút, giờ khởi hành trễ nhất là lúc mấy giờ?`
  ]
};

// Calendar Templates (C01 - C08)
export const CALENDAR_TEMPLATES = {
  C01: [
    (weekday: string, days: number, isAfter: boolean) =>
      `Hôm nay là ${weekday}. ${isAfter ? `Sau ${days} ngày` : `${days} ngày trước`} là thứ mấy?`,
    (weekday: string, days: number, isAfter: boolean) =>
      `Nếu thời điểm hiện tại rơi vào ${weekday}, thì ${isAfter ? `sau đó ${days} ngày` : `cách đây ${days} ngày`} sẽ là thứ mấy?`,
    (weekday: string, days: number, isAfter: boolean) =>
      `Biết ngày xuất phát là ${weekday}. Hỏi ${isAfter ? `${days} ngày sau` : `${days} ngày trước`} rơi vào thứ mấy trong tuần?`
  ],
  C02: [
    (weekday: string, days: number, isAfter: boolean) =>
      `Biết hôm nay là ${weekday}. ${isAfter ? `Sau ${days} ngày nữa` : `${days} ngày trước`} là thứ mấy?`,
    (weekday: string, days: number, isAfter: boolean) =>
      `Một khóa đào tạo khai giảng vào ${weekday}. Đúng ${days} ngày ${isAfter ? 'sau' : 'trước'} là thứ mấy?`,
    (weekday: string, days: number, isAfter: boolean) =>
      `Nếu mốc ban đầu là ${weekday}, vận dụng chu kỳ tuần (7 ngày) để tính xem ${isAfter ? `sau ${days} ngày` : `${days} ngày trước`} là thứ mấy:`
  ],
  C03: [
    (d: number, m: number, y: number, offset: number, isAfter: boolean) =>
      `Ngày ${d}/${m}/${y}, ${isAfter ? `sau đó ${offset} ngày` : `${offset} ngày trước`} (trong cùng tháng ${m}) là ngày mấy?`,
    (d: number, m: number, y: number, offset: number, isAfter: boolean) =>
      `Tháng ${m}/${y}: từ ngày ${d}, ${isAfter ? `cộng thêm ${offset} ngày` : `lùi lại ${offset} ngày`} sẽ đến ngày nào?`,
    (d: number, m: number, y: number, offset: number, isAfter: boolean) =>
      `Vào tháng ${m} năm ${y}, ${isAfter ? `sau ngày ${d} đúng ${offset} ngày` : `trước ngày ${d} đúng ${offset} ngày`} là ngày mấy?`
  ],
  C04: [
    (d1: number, d2: number, m: number, y: number) =>
      `Từ ngày ${d1}/${m}/${y} đến ngày ${d2}/${m}/${y} đã qua bao nhiêu ngày (không tính ngày bắt đầu)?`,
    (d1: number, d2: number, m: number, y: number) =>
      `Trong tháng ${m}/${y}, khoảng thời gian từ ngày ${d1} đến ngày ${d2} gồm bao nhiêu ngày (không kể ngày đầu)?`,
    (d1: number, d2: number, m: number, y: number) =>
      `Tính khoảng cách số ngày giữa ngày ${d1}/${m}/${y} và ngày ${d2}/${m}/${y} (không tính ngày bắt đầu):`
  ],
  C05: [
    (d: string, days: number, isAfter: boolean) =>
      `Từ ngày ${d}, ${isAfter ? `sau đó ${days} ngày` : `${days} ngày trước`} (qua ranh giới tháng) là ngày nào (DD/MM/YYYY)?`,
    (d: string, days: number, isAfter: boolean) =>
      `Hợp đồng bắt đầu từ ngày ${d}. ${isAfter ? `Sau đúng ${days} ngày` : `${days} ngày trước`} sẽ rơi vào ngày nào?`,
    (d: string, days: number, isAfter: boolean) =>
      `Tính ngày kết quả (DD/MM/YYYY) khi ${isAfter ? `tiến thêm ${days} ngày` : `lùi lại ${days} ngày`} kể từ mốc ${d}:`
  ],
  C06: [
    (d: string, days: number, isAfter: boolean) =>
      `Từ ngày ${d}, ${isAfter ? `sau đó ${days} ngày` : `${days} ngày trước`} (bước qua năm mới) là ngày nào (DD/MM/YYYY)?`,
    (d: string, days: number, isAfter: boolean) =>
      `Một dự án khởi động ngày ${d}. Sau thời gian ${days} ngày ${isAfter ? 'sang năm tiếp theo' : 'ngược về năm trước'} là ngày nào?`,
    (d: string, days: number, isAfter: boolean) =>
      `Xác định ngày (DD/MM/YYYY) sau khi ${isAfter ? `cộng ${days} ngày` : `trừ ${days} ngày`} từ mốc ${d} qua ranh giới năm:`
  ],
  C07: [
    (d: string, days: number, leapNote: string) =>
      `Từ ngày ${d} (${leapNote}), sau đó ${days} ngày là ngày nào (DD/MM/YYYY)?`,
    (d: string, days: number, leapNote: string) =>
      `Biết ${leapNote}. Hỏi sau ngày ${d} đúng ${days} ngày là ngày nào?`,
    (d: string, days: number, leapNote: string) =>
      `Tính ngày tiếp theo (DD/MM/YYYY) sau mốc ${d} đúng ${days} ngày (${leapNote}):`
  ],
  C08: [
    (d1: string, d2: string) =>
      `Kỳ nghỉ kéo dài từ ngày ${d1} đến hết ngày ${d2}, tính cả hai ngày đầu và cuối. Kỳ nghỉ có tất cả bao nhiêu ngày?`,
    (d1: string, d2: string) =>
      `Đợt tập huấn bắt đầu từ ${d1} tới hết ${d2}. Tính cả ngày bắt đầu và ngày kết thúc, đợt tập huấn kéo dài bao nhiêu ngày?`,
    (d1: string, d2: string) =>
      `Có bao nhiêu ngày trong khoảng từ ${d1} đến ${d2} (tính cả ngày đầu lẫn ngày cuối)?`
  ]
};
