import { motion } from 'framer-motion';

// تأثير "قلب ثلاثي الأبعاد" للنص — كل كلمة تنقلب للأسفل من حافتها العلوية
// (rotateX) لتستقر بشكل مسطّح، بتتابع (stagger) عبر الكلمات. مبني يدوياً
// بـ Framer Motion فقط (بدون أي حزمة/سجل خارجي).
//
// يعمل على مستوى الكلمة وليس الحرف عمداً — تقطيع النص العربي حرفاً حرفاً
// يكسر اتصال الحروف الطبيعي (Arabic script shaping).
//
// `parts`: مصفوفة { text, className? } — تُدمج كتسلسل كلمات واحد متواصل
// (نفس تتابع stagger) بحيث يمكن تلوين جزء منها (مثل كلمة مميّزة بتدرّج لوني)
// دون كسر إيقاع الحركة.
const Text3DFlip = ({
  parts,
  className = '',
  rotateDirection = 'top',
  staggerDuration = 0.08,
  delay = 0,
  transition = { type: 'spring', damping: 25, stiffness: 160 },
}) => {
  const words = parts.flatMap(({ text, className: partClassName, style: partStyle }) =>
    text.split(' ').filter(Boolean).map(word => ({ word, className: partClassName, style: partStyle }))
  );

  const fromRotate = rotateDirection === 'top' ? -90 : 90;
  const originY = rotateDirection === 'top' ? '0%' : '100%';

  return (
    <span className={`inline ${className}`} style={{ perspective: 800 }}>
      {words.map(({ word, className: wordClassName, style: wordStyle }, i) => (
        <span key={i} className="inline-block" style={{ verticalAlign: 'top' }}>
          {/* الدوران (rotateX) على هذا العنصر الخارجي فقط. لون/تدرّج الكلمة
              (wordClassName) على عنصر داخلي غير مُحرَّك عمداً — دمج تدرّج
              bg-clip-text مع عنصر يحمل transform مباشرة يجعل بعض المتصفحات
              ترسمه ضمن طبقة GPU منفصلة، فتُفقد تفاصيل دقيقة كنقاط الحروف
              العربية (ث/ت/ن) أو تصبح شبه غير مرئية. */}
          {/* No opacity fade: a word at -90° is edge-on and invisible anyway,
              so the flip reads the same. Starting from opacity 0 made the
              browser treat the headline — the largest thing on screen — as
              not yet painted until every word had faded in, which delayed the
              page's "largest content" moment by over a second on phones. */}
          <motion.span
            initial={{ rotateX: fromRotate }}
            animate={{ rotateX: 0 }}
            transition={{ ...transition, delay: delay + i * staggerDuration }}
            className="inline-block"
            style={{ transformOrigin: `center ${originY}` }}
          >
            <span className={wordClassName ?? ''} style={wordStyle}>{word}</span>
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
};

export default Text3DFlip;
