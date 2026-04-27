import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export const metadata = {
  title: 'سياسة الخصوصية — KoraX',
}

export default function PrivacyPage() {
  return (
    <div>
      <Header title="سياسة الخصوصية" />
      <div className="page-content px-4 py-6 space-y-6 text-sm text-muted leading-relaxed">

        <div>
          <p className="text-xs text-muted mb-4">آخر تحديث: أبريل 2026</p>
          <p>
            يوضح هذا المستند كيفية جمع KoraX للمعلومات واستخدامها وحمايتها
            عند استخدامك لتطبيقنا على <span className="text-primary font-bold">korax.live</span>.
          </p>
        </div>

        <Section title="1. المعلومات التي نجمعها">
          <ul className="space-y-2 list-disc list-inside">
            <li>اسمك وبريدك الإلكتروني عند تسجيل الدخول بـ Google</li>
            <li>توقعاتك ونقاطك داخل التطبيق</li>
            <li>بيانات الفريق الذي بنيته (محفوظة محلياً على جهازك)</li>
          </ul>
        </Section>

        <Section title="2. كيف نستخدم المعلومات">
          <ul className="space-y-2 list-disc list-inside">
            <li>عرض اسمك في جدول الترتيب</li>
            <li>حفظ توقعاتك ومكافآتك</li>
            <li>تحسين تجربة التطبيق</li>
          </ul>
        </Section>

        <Section title="3. مشاركة البيانات">
          <p>
            لا نبيع بياناتك ولا نشاركها مع أطراف ثالثة.
            نستخدم خدمات Google OAuth لتسجيل الدخول وNewsAPI لجلب الأخبار.
          </p>
        </Section>

        <Section title="4. حفظ البيانات">
          <p>
            يتم تخزين بياناتك على خوادم آمنة عبر Railway.
            يمكنك طلب حذف حسابك في أي وقت عبر التواصل معنا.
          </p>
        </Section>

        <Section title="5. ملفات تعريف الارتباط (Cookies)">
          <p>
            نستخدم cookies لحفظ جلسة تسجيل الدخول فقط.
            لا نستخدم cookies للإعلانات أو التتبع.
          </p>
        </Section>

        <Section title="6. التواصل معنا">
          <p>
            لأي استفسار بخصوص خصوصيتك:{' '}
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
