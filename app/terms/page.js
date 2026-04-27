import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export const metadata = {
  title: 'شروط الاستخدام — KoraX',
}

export default function TermsPage() {
  return (
    <div>
      <Header title="شروط الاستخدام" />
      <div className="page-content px-4 py-6 space-y-6 text-sm text-muted leading-relaxed">

        <div>
          <p className="text-xs text-muted mb-4">آخر تحديث: أبريل 2026</p>
          <p>
            باستخدامك لتطبيق <span className="text-primary font-bold">KoraX</span> على{' '}
            <span className="text-primary font-bold">korax.live</span> فأنت توافق على هذه الشروط.
          </p>
        </div>

        <Section title="1. الخدمة">
          <p>
            KoraX هو تطبيق ترفيهي لتوقع نتائج كأس العالم 2026.
            النقاط والمكافآت للتسلية فقط وليس لها قيمة مادية.
          </p>
        </Section>

        <Section title="2. حساب المستخدم">
          <ul className="space-y-2 list-disc list-inside">
            <li>يجب أن يكون عمرك 13 سنة أو أكثر</li>
            <li>أنت مسؤول عن حماية حسابك</li>
            <li>ممنوع إنشاء حسابات متعددة للتلاعب بالترتيب</li>
          </ul>
        </Section>

        <Section title="3. السلوك المقبول">
          <ul className="space-y-2 list-disc list-inside">
            <li>الاستخدام الشخصي غير التجاري فقط</li>
            <li>ممنوع التلاعب أو اختراق التطبيق</li>
            <li>ممنوع نشر محتوى مسيء في المجموعات</li>
          </ul>
        </Section>

        <Section title="4. الملكية الفكرية">
          <p>
            جميع محتويات KoraX محمية. لا يجوز نسخ أو إعادة توزيع
            أي جزء من التطبيق بدون إذن.
          </p>
        </Section>

        <Section title="5. إيقاف الخدمة">
          <p>
            نحتفظ بحق إيقاف أو تعليق أي حساب يخالف هذه الشروط
            دون إشعار مسبق.
          </p>
        </Section>

        <Section title="6. إخلاء المسؤولية">
          <p>
            KoraX غير مسؤول عن أي قرارات تُتخذ بناءً على التوقعات
            المعروضة في التطبيق. التوقعات للترفيه فقط.
          </p>
        </Section>

        <Section title="7. التواصل معنا">
          <p>
            لأي استفسار:{' '}
            <span className="text-primary font-bold">m7md87.ot@gmail.com</span>
          </p>
        </Section>

      </div>
      <BottomNav />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-black text-text text-base mb-2">{title}</h2>
      {children}
    </div>
  )
}
