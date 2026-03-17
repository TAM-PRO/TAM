import * as XLSX from 'xlsx';

export const downloadExcelTemplate = () => {
  const templateData = [
    {
      id: 'start',
      name: 'מסך פתיחה',
      title: 'בחירת תקלה',
      type: 'menu',
      text: 'במה אוכל לעזור לך היום?',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '', nextLabel: '', nextTarget: '',
      options: JSON.stringify([
        { label: 'לא רואים וידאו מהמצלמה', targetId: 'node_video_start' },
        { label: 'המצלמה לא מצליחה להתפקס', targetId: 'node_camera_focus' },
        { label: 'אין נתוני מכ"מ', targetId: 'node_radar_start' },
        { label: 'מסך שחור', targetId: 'node_black_screen' },
        { label: 'אין רשת / אפליקציה לא עולה', targetId: 'node_network_start' },
        { label: 'תקלות מתחים', targetId: 'node_power_start' }
      ]),
      endType: '', mediaType: 'none', mediaUrl: ''
    },
    // --- וידאו ---
    {
      id: 'node_video_start',
      name: 'בדיקת התנגדות מצלמה',
      title: 'איתור תקלות וידאו',
      type: 'question',
      text: 'גש למצלמה ובעדינות נסה לסובב אותה ימינה ושמאלה. האם יש התנגדות מכאנית?',
      yesLabel: 'כן', yesTarget: 'node_network_start',
      noLabel: 'לא', noTarget: 'node_power_start',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    // --- פוקוס מצלמה ---
    {
      id: 'node_camera_focus',
      name: 'ניקיון עדשות',
      title: 'המצלמה לא מתפקסת',
      type: 'action',
      text: 'בצע ניקיון עדשות.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_camera_focus_check',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_camera_focus_check',
      name: 'בדיקת פוקוס',
      title: 'המצלמה לא מתפקסת',
      type: 'question',
      text: 'האם המצלמה מצליחה להתפקס כעת?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_contact_kela',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    // --- מכ"מ ---
    {
      id: 'node_radar_start',
      name: 'החלפת כבל מכ"מ לסוויץ',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'action',
      text: 'החלף כבל תקשורת המחבר בין המכ"מ לסוויץ\'.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_radar_check_1',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_radar_check_1',
      name: 'בדיקה 1 - מכ"מ',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'question',
      text: 'האם התקלה סודרה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_radar_replace_cable_edge',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_radar_replace_cable_edge',
      name: 'החלפת כבל EDGE ל-FOB',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'action',
      text: 'החלף כבל תקשורת המחבר סוויץ\' EDGE לסוויץ\' FOB.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_radar_check_2',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_radar_check_2',
      name: 'בדיקה 2 - מכ"מ',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'question',
      text: 'האם התקלה סודרה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_radar_replace_cable_fob',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_radar_replace_cable_fob',
      name: 'החלפת כבל FOB לשרת',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'action',
      text: 'החלף כבל תקשורת המחבר סוויץ\' FOB למחשב שרת.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_radar_check_3',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_radar_check_3',
      name: 'בדיקה 3 - מכ"מ',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'question',
      text: 'האם התקלה סודרה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_radar_replace_cable_operator',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_radar_replace_cable_operator',
      name: 'החלפת כבל FOB למפעיל',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'action',
      text: 'החלף כבל תקשורת המחבר סוויץ\' FOB למחשב מפעיל.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_radar_check_4',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_radar_check_4',
      name: 'בדיקה 4 - מכ"מ',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'question',
      text: 'האם התקלה סודרה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_radar_replace_switch_edge',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_radar_replace_switch_edge',
      name: 'החלפת סוויץ EDGE',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'action',
      text: 'החלף סוויץ\' EDGE.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_radar_check_5',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_radar_check_5',
      name: 'בדיקה 5 - מכ"מ',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'question',
      text: 'האם התקלה סודרה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_radar_replace_switch_fob',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_radar_replace_switch_fob',
      name: 'החלפת סוויץ FOB',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'action',
      text: 'החלף סוויץ\' FOB.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_radar_check_6',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_radar_check_6',
      name: 'בדיקה 6 - מכ"מ',
      title: 'איתור תקלות תקשורת מכ"מ',
      type: 'question',
      text: 'האם התקלה סודרה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_contact_kela',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    // --- מתחים ---
    {
      id: 'node_power_start',
      name: 'בדיקת נוריות מערכת',
      title: 'איתור תקלות מתחים',
      type: 'action',
      text: 'בדוק שרכיבי המערכת דולקים (נורות דולקות).\nרכיבי המערכת:\n• מסכי מפעיל\n• מחשב מפעיל\n• מחשב שרת\n• סוויץ\' PWF FOB',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_power_check_all_on',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_check_all_on',
      name: 'האם הכל דולק?',
      title: 'איתור תקלות מתחים',
      type: 'question',
      text: 'האם כל רכיבי המערכת דולקים?',
      yesLabel: 'כן', yesTarget: 'node_power_check_edge_led',
      noLabel: 'לא', noTarget: 'node_power_disconnect_suspect',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_check_edge_led',
      name: 'בדיקת נורית EDGE',
      title: 'איתור תקלות מתחים',
      type: 'question',
      text: 'האם נורית אדומה של סוויץ\' PWF-Edge דולקת?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_power_disconnect_converter',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_disconnect_converter',
      name: 'ניתוק ממיר מתח',
      title: 'איתור תקלות מתחים',
      type: 'action',
      text: 'נתק כבל חשמל של ממיר המתח וחבר במקומו מטען עם טלפון.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_power_check_phone_charging_1',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_check_phone_charging_1',
      name: 'בדיקת טעינת טלפון 1',
      title: 'איתור תקלות מתחים',
      type: 'question',
      text: 'האם הטלפון נטען?',
      yesLabel: 'כן', yesTarget: 'node_power_replace_wall_cable',
      noLabel: 'לא', noTarget: 'node_power_infra_issue',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_replace_wall_cable',
      name: 'החלפת כבל קיר',
      title: 'איתור תקלות מתחים',
      type: 'action',
      text: 'החלף את כבל מתח קיר של המטען.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_power_check_switch_led_1',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_check_switch_led_1',
      name: 'בדיקת נורית סוויץ 1',
      title: 'איתור תקלות מתחים',
      type: 'question',
      text: 'האם נורית הסוויץ\' נדלקה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_power_replace_dc_cable',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_replace_dc_cable',
      name: 'החלפת כבל DC',
      title: 'איתור תקלות מתחים',
      type: 'action',
      text: 'החלף את כבל ה-DC של המטען.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_power_check_switch_led_2',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_check_switch_led_2',
      name: 'בדיקת נורית סוויץ 2',
      title: 'איתור תקלות מתחים',
      type: 'question',
      text: 'האם נורית הסוויץ\' נדלקה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_power_replace_switch',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_replace_switch',
      name: 'החלפת סוויץ',
      title: 'איתור תקלות מתחים',
      type: 'action',
      text: 'החלף סוויץ\'.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_power_check_switch_led_3',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_check_switch_led_3',
      name: 'בדיקת נורית סוויץ 3',
      title: 'איתור תקלות מתחים',
      type: 'question',
      text: 'האם נורית הסוויץ\' נדלקה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_contact_kela',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_disconnect_suspect',
      name: 'ניתוק רכיב חשוד',
      title: 'איתור תקלות מתחים',
      type: 'action',
      text: 'נתק כבל חשמל של הרכיב החשוד וחבר במקומו מטען עם טלפון.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_power_check_phone_charging_2',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_check_phone_charging_2',
      name: 'בדיקת טעינת טלפון 2',
      title: 'איתור תקלות מתחים',
      type: 'question',
      text: 'האם הטלפון נטען?',
      yesLabel: 'כן', yesTarget: 'node_power_replace_suspect_cable',
      noLabel: 'לא', noTarget: 'node_power_infra_issue',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_replace_suspect_cable',
      name: 'החלפת כבל חשוד',
      title: 'איתור תקלות מתחים',
      type: 'action',
      text: 'החלף כבל חשמל של היחידה החשודה.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_power_check_suspect_fixed',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_check_suspect_fixed',
      name: 'בדיקת תיקון רכיב חשוד',
      title: 'איתור תקלות מתחים',
      type: 'question',
      text: 'האם התקלה סודרה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_contact_kela',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_power_infra_issue',
      name: 'תקלת תשתית',
      title: 'תקלת תשתית',
      type: 'end',
      text: 'תקלת תשתית - צור קשר עם יחידת הבינוי.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: '', nextTarget: '', options: '', endType: 'error', mediaType: 'none', mediaUrl: ''
    },
    // --- רשת / אפליקציה ---
    {
      id: 'node_network_start',
      name: 'ביצוע RESET',
      title: 'איתור תקלות רשת / אפליקציה',
      type: 'action',
      text: 'בצע RESET ל:\n• סוויץ\' PWF-FOB\n• מחשב שרת\n• מחשב מפעיל',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_network_check_leds',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_network_check_leds',
      name: 'בדיקת נוריות FOB',
      title: 'איתור תקלות רשת / אפליקציה',
      type: 'action',
      text: 'בדוק שהנוריות בתוך סוויץ\' PWF-FOB דולקות בירוק.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_network_are_leds_on',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_network_are_leds_on',
      name: 'האם נוריות דולקות',
      title: 'איתור תקלות רשת / אפליקציה',
      type: 'question',
      text: 'האם הנוריות דולקות?',
      yesLabel: 'כן', yesTarget: 'node_network_check_app',
      noLabel: 'לא', noTarget: 'node_network_replace_fob',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_network_check_app',
      name: 'בדיקת אפליקציה',
      title: 'איתור תקלות רשת / אפליקציה',
      type: 'action',
      text: 'ודא שיש רשת / האפליקציה עולה.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_network_is_app_up',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_network_is_app_up',
      name: 'האם האפליקציה עולה',
      title: 'איתור תקלות רשת / אפליקציה',
      type: 'question',
      text: 'האם התקלה סודרה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_contact_kela',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_network_replace_fob',
      name: 'החלפת סוויץ FOB (רשת)',
      title: 'איתור תקלות רשת / אפליקציה',
      type: 'action',
      text: 'החלף סוויץ\' FOB.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_network_check_fob_replaced',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_network_check_fob_replaced',
      name: 'בדיקה לאחר החלפת FOB',
      title: 'איתור תקלות רשת / אפליקציה',
      type: 'question',
      text: 'האם התקלה סודרה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_contact_kela',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    // --- מסך שחור ---
    {
      id: 'node_black_screen',
      name: 'בדיקת חיבורי מסך',
      title: 'מסך שחור',
      type: 'action',
      text: '1. בדוק חיבור תקין של כבל המתח למסך.\n2. בדוק חיבור תקין של כבל ה-DP/HDMI למסך.\n3. וודא כי מחשב המפעיל עובד.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: 'המשך', nextTarget: 'node_black_screen_check',
      options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_black_screen_check',
      name: 'בדיקת מסך שחור',
      title: 'מסך שחור',
      type: 'question',
      text: 'האם התקלה סודרה?',
      yesLabel: 'כן', yesTarget: 'node_success',
      noLabel: 'לא', noTarget: 'node_power_start',
      nextLabel: '', nextTarget: '', options: '', endType: '', mediaType: 'none', mediaUrl: ''
    },
    // --- סיומים ---
    {
      id: 'node_success',
      name: 'הצלחה',
      title: 'הבעיה נפתרה',
      type: 'end',
      text: 'הבעיה נפתרה בהצלחה!',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: '', nextTarget: '', options: '', endType: 'success', mediaType: 'none', mediaUrl: ''
    },
    {
      id: 'node_contact_kela',
      name: 'תמיכה טכנית KELA',
      title: 'נדרשת עזרה נוספת',
      type: 'end',
      text: 'התקלה לא נפתרה.\nאנא צור קשר עם חברת KELA להמשך טיפול.',
      yesLabel: '', yesTarget: '', noLabel: '', noTarget: '',
      nextLabel: '', nextTarget: '', options: '', endType: 'error', mediaType: 'none', mediaUrl: ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Troubleshooting_Nodes');
  XLSX.writeFile(workbook, 'troubleshooting_template.xlsx');
};

export const parseExcelFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const nodes: any = {};
        json.forEach((row: any) => {
          if (!row.id) return;
          
          let options = [];
          if (row.options) {
            try {
              options = JSON.parse(row.options);
            } catch (err) {
              console.warn('Failed to parse options for node', row.id);
            }
          }

          nodes[row.id] = {
            id: row.id,
            name: row.name || '',
            title: row.title || '',
            type: row.type || 'question',
            text: row.text || '',
            yesLabel: row.yesLabel || 'כן',
            yesTarget: row.yesTarget || '',
            noLabel: row.noLabel || 'לא',
            noTarget: row.noTarget || '',
            nextLabel: row.nextLabel || 'המשך',
            nextTarget: row.nextTarget || '',
            options: options,
            endType: row.endType || 'success',
            media: {
              type: row.mediaType || 'none',
              url: row.mediaUrl || ''
            }
          };
        });

        if (!nodes['start']) {
          reject(new Error('קובץ האקסל חייב להכיל שורה עם id="start"'));
          return;
        }

        resolve(nodes);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
