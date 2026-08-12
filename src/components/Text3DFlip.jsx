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
  const words = parts.flatMap(({ text, className: partClassName }) =>
    text.split(' ').filter(Boolean).map(word => ({ word, className: partClassName }))
  );

  const fromRotate = rotateDirection === 'top' ? -90 : 90;
  const originY = rotateDirection === 'top' ? '0%' : '100%';

  return (
    <span className={`inline ${className}`} style={{ perspective: 800 }}>
      {words.map(({ word, className: wordClassName }, i) => (
        <span key={i} className="inline-block" style={{ verticalAlign: 'top' }}>
          {/* الدوران (rotateX) على هذا العنصر الخارجي فقط. لون/تدرّج الكلمة
              (wordClassName) على عنصر داخلي غير مُحرَّك عمداً — دمج تدرّج
              bg-clip-text مع عنصر يحمل transform مباشرة يجعل بعض المتصفحات
              ترسمه ضمن طبقة GPU منفصلة، فتُفقد تفاصيل دقيقة كنقاط الحروف
              العربية (ث/ت/ن) أو تصبح شبه غير مرئية. */}
          <motion.span
            initial={{ rotateX: fromRotate, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ ...transition, delay: delay + i * staggerDuration }}
            className="inline-block"
            style={{ transformOrigin: `center ${originY}` }}
          >
            <span className={wordClassName ?? ''}>{word}</span>
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
};

export default Text3DFlip;
