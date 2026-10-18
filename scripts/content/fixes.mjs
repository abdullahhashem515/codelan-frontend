// إصلاحات على محتوى قائم — لا إضافات جديدة.
//
// 1) مقال الـRadius (id=1) كان 116 حرفاً: جملة واحدة، وحقوله الإنجليزية فارغة.
//    الجملة الأصلية محفوظة كما هي في مطلع المقال، والباقي توسعة حولها.
// 2) الشهادتان القائمتان بيانات تجريبية بأسماء عامة، وإحداهما تحمل الاسم القديم
//    «CodeLAN». تُعطَّل عبر is_active ولا تُحذف — الصف يبقى والموقع يُخفيه.

export const RADIUS_POST = {
  slug: 'importance-of-radius-server',
  titleAr: 'أهمية استخدام الـ Radius سيرفر في الشبكات المحلية',
  titleEn: 'Why a RADIUS Server Belongs in Your Local Network',
  excerptAr: 'كلمة مرور واحدة يعرفها الجميع ليست سياسة وصول. نشرح ما يقدّمه RADIUS من مصادقة وتفويض ومحاسبة، وكيف يُربط بـ MikroTik عملياً، ومتى لا تحتاجه أصلاً.',
  excerptEn: 'A single password everyone knows is not an access policy. What RADIUS gives you in authentication, authorisation and accounting, how to wire it to MikroTik in practice, and when you do not need it at all.',
  contentAr: `يتناول هذا المقال دور الـ Radius سيرفر في تنظيم وإدارة وتأمين بيانات المستخدمين داخل الشبكات المحلية بشكل احترافي.

الصورة التي نجدها في أغلب الشركات: كلمة مرور واحدة لشبكة الواي فاي، يعرفها كل موظف، وتُعطى للضيوف عند الطلب، ولم تتغيّر منذ التركيب. هذه ليست سياسة وصول — هذا غياب سياسة.

## لماذا لا تكفي كلمة المرور المشتركة

- **لا تعرف من دخل.** السجلّات تُظهر عناوين MAC لا أشخاصاً. عند وقوع حادثة لا تملك ما تبدأ منه.
- **خروج موظف يعني تغيير كلمة المرور على كل جهاز.** ولأن الكلفة مرتفعة، لا أحد يغيّرها فعلاً.
- **لا تمييز بين المستخدمين.** المحاسب والضيف والكاميرا كلهم بنفس المفتاح وبنفس الصلاحيات.
- **تسريب واحد يفتح كل شيء.** ورقة على مكتب، أو هاتف ضيف، يكفي.

## ما الذي يفعله RADIUS

الاسم اختصار لـ Remote Authentication Dial-In User Service، ووظيفته تلخّصها ثلاث كلمات — AAA:

| الوظيفة | المعنى | ما تكسبه |
|---|---|---|
| Authentication | من أنت؟ | حساب لكل شخص، لا مفتاح مشترك |
| Authorization | ما المسموح لك؟ | نطاق شبكي وسرعة وصلاحيات لكل دور |
| Accounting | ماذا فعلت ومتى؟ | سجلّ دخول وخروج واستهلاك لكل حساب |

النقطة الجوهرية: أجهزة الشبكة — الراوتر، نقاط الوصول، السويتشات — تتوقف عن تخزين كلمات المرور. تسأل الخادم، والخادم يُقرّر. تعطيل موظف يصبح تغييراً واحداً في مكان واحد، يسري فوراً على كل الأجهزة.

## المكوّنات

- **خادم RADIUS:** \`FreeRADIUS\` على لينكس هو الخيار المفتوح الأكثر انتشاراً. يخزّن الحسابات في ملف، أو في MySQL/PostgreSQL، أو يربطها بـ LDAP / Active Directory الموجود لديك.
- **العميل (NAS):** جهاز الشبكة الذي يسأل — راوتر MikroTik، نقطة وصول، أو سويتش يدعم 802.1X.
- **السر المشترك:** كلمة تُعرَّف على الطرفين لتوثيق القناة بينهما. ليست كلمة مرور المستخدم.

## الربط مع MikroTik

على الراوتر، تعريف الخادم:

\`\`\`
/radius
add address=10.0.10.5 secret=<السر-المشترك> \\
    service=hotspot,login,ppp,wireless timeout=1s
\`\`\`

ثم تفعيل الاعتماد عليه:

\`\`\`
/ip hotspot profile
set [find default=yes] use-radius=yes

/user aaa
set use-radius=yes accounting=yes
\`\`\`

وعلى الخادم، تعريف الراوتر كعميل في \`clients.conf\`:

\`\`\`
client mikrotik-core {
    ipaddr = 10.0.10.1
    secret = <السر-المشترك>
    nastype = other
}
\`\`\`

الخادم يستطيع أن يُعيد مع الموافقة خصائص إضافية — النطاق الذي يُوضع فيه المستخدم، وحدّ السرعة، ومدّة الجلسة:

\`\`\`
موظف-محاسبة  Cleartext-Password := "..."
    Tunnel-Type = VLAN,
    Tunnel-Medium-Type = IEEE-802,
    Tunnel-Private-Group-Id = "20",
    Mikrotik-Rate-Limit = "8M/8M"
\`\`\`

هنا تلتقي الفكرة مع تقسيم الشبكة: المستخدم لا يختار نطاقه، بل يُوضع فيه تلقائياً بحسب هويته — أينما اتصل ومن أي منفذ.

## أخطاء شائعة

- **اختبار \`timeout=1s\` بلا خادم احتياطي.** إن سقط الخادم توقّفت المصادقة على الشبكة كلها. عرّف خادمين، واترك حساب مدير محلياً على الراوتر للطوارئ.
- **استخدام PAP على شبكة غير موثوقة.** يمرّر كلمة المرور بصيغة قابلة للقراءة. استخدم \`MS-CHAPv2\` داخل \`PEAP\`، أو \`EAP-TLS\` بالشهادات إن كانت البيئة تحتملها.
- **إهمال قاعدة المحاسبة.** جداول \`radacct\` تنمو بسرعة. اضبط تنظيفاً دورياً، وإلا امتلأ القرص وتوقّف الخادم.
- **سر مشترك ضعيف أو مكرّر.** سرّ مختلف لكل جهاز، طويل وعشوائي.
- **فتح المنفذين 1812/1813 خارج نطاق الإدارة.** يجب ألا يصل إليهما أحد غير أجهزة الشبكة.

## متى لا تحتاجه

لا تُركّب خادماً لعشرة مستخدمين في مكتب واحد. الكلفة الحقيقية ليست التركيب بل التشغيل: نسخ احتياطية، وشهادات تنتهي، وخادم يجب أن يبقى حياً وإلا توقّفت الشبكة.

> القاعدة العملية: إن كان لديك أكثر من خمسة وعشرين مستخدماً، أو دوران في الموظفين، أو شبكة ضيوف دائمة، أو التزام بسجلّ وصول — فالخادم يوفّر عليك أكثر مما يكلّفك. دون ذلك، شبكة ضيوف معزولة وكلمة مرور قوية تتغيّر دورياً تكفيان.`,
  contentEn: `This article covers the role of a RADIUS server in organising, managing and securing user data inside local networks.

The picture we find in most companies: one Wi-Fi password, known to every employee, handed to visitors on request, unchanged since installation. That is not an access policy — it is the absence of one.

## Why a shared password is not enough

- **You do not know who connected.** Logs show MAC addresses, not people. When an incident happens you have nothing to start from.
- **An employee leaving means changing the password on every device.** Because that is expensive, nobody actually does it.
- **No distinction between users.** The accountant, the visitor and the camera all hold the same key and the same rights.
- **One leak opens everything.** A note on a desk, or a visitor's phone, is enough.

## What RADIUS does

The name stands for Remote Authentication Dial-In User Service, and three words summarise its job — AAA:

| Function | Meaning | What you gain |
|---|---|---|
| Authentication | Who are you? | An account per person, not a shared key |
| Authorization | What may you do? | A segment, a speed and rights per role |
| Accounting | What did you do, and when? | Login, logout and usage records per account |

The essential point: network devices — the router, the access points, the switches — stop storing passwords. They ask the server, and the server decides. Disabling an employee becomes one change in one place, effective immediately across every device.

## The components

- **A RADIUS server:** \`FreeRADIUS\` on Linux is the most widely deployed open option. It stores accounts in a file, in MySQL/PostgreSQL, or against the LDAP / Active Directory you already run.
- **The client (NAS):** the network device doing the asking — a MikroTik router, an access point, or a switch that supports 802.1X.
- **The shared secret:** a string configured on both sides to authenticate the channel between them. It is not a user password.

## Wiring it to MikroTik

On the router, define the server:

\`\`\`
/radius
add address=10.0.10.5 secret=<shared-secret> \\
    service=hotspot,login,ppp,wireless timeout=1s
\`\`\`

Then tell the services to use it:

\`\`\`
/ip hotspot profile
set [find default=yes] use-radius=yes

/user aaa
set use-radius=yes accounting=yes
\`\`\`

And on the server, declare the router as a client in \`clients.conf\`:

\`\`\`
client mikrotik-core {
    ipaddr = 10.0.10.1
    secret = <shared-secret>
    nastype = other
}
\`\`\`

The server can return attributes alongside the acceptance — the segment the user lands in, a rate limit, a session timeout:

\`\`\`
accounting-user  Cleartext-Password := "..."
    Tunnel-Type = VLAN,
    Tunnel-Medium-Type = IEEE-802,
    Tunnel-Private-Group-Id = "20",
    Mikrotik-Rate-Limit = "8M/8M"
\`\`\`

This is where the idea meets network segmentation: the user does not choose their segment, they are placed in it automatically by identity — wherever they connect, from whichever port.

## Common mistakes

- **Testing \`timeout=1s\` with no backup server.** If the server goes down, authentication stops network-wide. Define two servers, and keep a local admin account on the router for emergencies.
- **Using PAP over an untrusted network.** It passes the password in readable form. Use \`MS-CHAPv2\` inside \`PEAP\`, or \`EAP-TLS\` with certificates if the environment can carry it.
- **Neglecting the accounting database.** \`radacct\` tables grow fast. Schedule pruning, or the disk fills and the server stops.
- **A weak or reused shared secret.** A different secret per device, long and random.
- **Exposing ports 1812/1813 outside the management segment.** Nothing but network devices should reach them.

## When you do not need it

Do not deploy a server for ten users in one office. The real cost is not installation but operation: backups, certificates that expire, and a server that must stay alive or the network stops.

> The practical rule: if you have more than twenty-five users, or staff turnover, or a permanent guest network, or an obligation to keep access records — the server saves you more than it costs. Below that, an isolated guest network and a strong password rotated regularly will do.`,
};
