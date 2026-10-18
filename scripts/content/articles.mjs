// Draft article content for the Codelanco admin panel. Written to be pasted into
// /admin/articles field by field — there is no API credential here to post it.
export const ARTICLES = [
  {
    key: 'vlan',
    titleAr: 'تقسيم شبكة الشركة إلى VLANs على راوتر MikroTik — الطريقة الصحيحة',
    titleEn: 'Segmenting a Company Network into VLANs on MikroTik — The Right Way',
    excerptAr: 'شبكة مسطّحة واحدة تعني أن أي جهاز مصاب يرى كل شيء. نشرح كيف تُقسّم الشبكة إلى نطاقات معزولة على RouterOS باستخدام bridge VLAN filtering، وما الخطوة التي تُقفل الراوتر في وجهك إن نفّذتها في الترتيب الخطأ.',
    excerptEn: 'One flat network means any infected device sees everything. How to split it into isolated segments on RouterOS with bridge VLAN filtering — and which step locks you out if you run it in the wrong order.',
    contentAr: `معظم شبكات الشركات الصغيرة والمتوسطة التي نراها ميدانياً تعمل على نطاق واحد مسطّح: الحاسبات، وكاميرات المراقبة، وأجهزة الضيوف، وطابعة الشبكة، وبدالة الـ VoIP — كلها على 192.168.1.0/24. الشبكة تعمل، ولهذا لا أحد يلمسها. لكن هذا التصميم يعني شيئاً واحداً: أي جهاز مصاب داخل الشبكة يرى كل شيء آخر ويستطيع الوصول إليه.

تقسيم الشبكة إلى VLANs يحل هذا. وفي RouterOS الحديث الطريقة الصحيحة هي bridge VLAN filtering — لا واجهات منفصلة لكل منفذ.

## لماذا نقسّم؟

- **احتواء الاختطار:** جهاز مصاب في نطاق الضيوف لا يستطيع الوصول لسيرفر المحاسبة.
- **ضبط البث:** حركة البث (broadcast) تبقى داخل نطاقها ولا تُغرق الشبكة كلها.
- **جودة الخدمة:** حركة الـ VoIP والكاميرات تُعالج بأولوية منفصلة عن تحميلات المستخدمين.
- **وضوح المراقبة:** عند وجود مشكلة تعرف أي نطاق تفحص، لا 200 جهاز.

## تصميم مقترح

| النطاق | الرقم | الاستخدام |
|---|---|---|
| الإدارة | 10 | الراوتر والسويتشات ونقاط الوصول |
| المستخدمون | 20 | حاسبات الموظفين |
| الكاميرات | 30 | كاميرات IP والمسجّل |
| الضيوف | 40 | واي فاي الزوار — إنترنت فقط |
| الهاتف | 50 | بدالة VoIP والهواتف |

## التنفيذ على RouterOS

أولاً ننشئ الـ bridge ونترك الفلترة **معطّلة**:

\`\`\`
/interface bridge
add name=bridge-main vlan-filtering=no
\`\`\`

نضيف المنافذ، ونُعطي كل منفذ للمستخدم النهائي رقم النطاق الخاص به عبر \`pvid\`:

\`\`\`
/interface bridge port
add bridge=bridge-main interface=ether2 pvid=20
add bridge=bridge-main interface=ether3 pvid=30
add bridge=bridge-main interface=ether4 pvid=40
add bridge=bridge-main interface=ether5 pvid=50
add bridge=bridge-main interface=sfp-sfpplus1
\`\`\`

المنفذ الأخير هو الوصلة المشتركة (trunk) نحو السويتش، ولهذا تُرك بلا \`pvid\`.

نُعرّف النطاقات، ونحدّد أي منفذ يحملها موسومة (tagged):

\`\`\`
/interface bridge vlan
add bridge=bridge-main vlan-ids=10 tagged=bridge-main,sfp-sfpplus1
add bridge=bridge-main vlan-ids=20 tagged=bridge-main,sfp-sfpplus1 untagged=ether2
add bridge=bridge-main vlan-ids=30 tagged=bridge-main,sfp-sfpplus1 untagged=ether3
add bridge=bridge-main vlan-ids=40 tagged=bridge-main,sfp-sfpplus1 untagged=ether4
add bridge=bridge-main vlan-ids=50 tagged=bridge-main,sfp-sfpplus1 untagged=ether5
\`\`\`

لاحظ وجود \`bridge-main\` نفسه في قائمة \`tagged\`. هذا ما يسمح للراوتر أن يمتلك عنواناً داخل كل نطاق — وإهماله سبب شائع جداً لشبكة تعمل بين الأجهزة لكن بلا بوابة.

ثم واجهات VLAN وعناوينها:

\`\`\`
/interface vlan
add interface=bridge-main name=vlan20-users vlan-id=20
add interface=bridge-main name=vlan30-cctv  vlan-id=30
add interface=bridge-main name=vlan40-guest vlan-id=40

/ip address
add address=10.0.20.1/24 interface=vlan20-users
add address=10.0.30.1/24 interface=vlan30-cctv
add address=10.0.40.1/24 interface=vlan40-guest
\`\`\`

## الخطوة التي تُقفل الراوتر

تفعيل الفلترة يكون **آخر شيء**، وبعد التأكد من أن منفذ إدارتك مضبوط:

\`\`\`
/interface bridge set bridge-main vlan-filtering=yes
\`\`\`

في اللحظة التي تُنفّذ فيها هذا السطر، يبدأ الـ bridge بتطبيق جدول النطاقات حرفياً. إن كان الحاسب الذي تُدير منه الراوتر على منفذ لم تُعطه \`pvid\` صحيحاً، أو نسيت \`bridge-main\` من قائمة \`tagged\`، ينقطع اتصالك فوراً ولا سبيل للعودة إلا عبر المنفذ التسلسلي أو إعادة ضبط المصنع.

> قبل تنفيذ السطر الأخير استخدم \`/system scheduler\` لجدولة إعادة تشغيل بعد خمس دقائق، أو نفّذ الأمر عبر \`/system script\` مع \`safe mode\` مفعّلاً في Winbox (Ctrl+X). إن انقطع الاتصال يتراجع الراوتر عن التغيير تلقائياً.

## العزل بين النطاقات

التقسيم وحده لا يمنع المرور بينها — الراوتر يوجّه بين نطاقاته افتراضياً. العزل يحتاج قواعد جدار حماية صريحة:

\`\`\`
/ip firewall filter
add chain=forward action=accept connection-state=established,related
add chain=forward action=drop in-interface=vlan40-guest out-interface=vlan20-users
add chain=forward action=drop in-interface=vlan40-guest out-interface=vlan30-cctv
add chain=forward action=drop in-interface=vlan20-users out-interface=vlan30-cctv
\`\`\`

القاعدة الأولى ضرورية: بدونها تُقطع الردود على الاتصالات المسموح بها.

## ملاحظة على الأجهزة

ليست كل أجهزة MikroTik تُعالج فلترة النطاقات في العتاد. الموديلات المبنية على شرائح مثل CRS3xx تفعل ذلك بسرعة الخط، أما الموديلات الأصغر فتُعالجها في المعالج — وهو ما يظهر كاستهلاك CPU مرتفع وتأخير محسوس تحت الحمل. راجع جدول الميزات لموديلك قبل الاعتماد على تصميم كثيف النطاقات.`,
    contentEn: `Most small and mid-sized company networks we see in the field run on a single flat subnet: workstations, security cameras, guest devices, the network printer and the VoIP exchange — all on 192.168.1.0/24. It works, which is exactly why nobody touches it. But that design means one thing: any infected device inside the network can see and reach everything else.

VLAN segmentation fixes this. On modern RouterOS the correct approach is bridge VLAN filtering — not a separate interface per port.

## Why segment?

- **Containment:** a compromised device on the guest segment cannot reach the accounting server.
- **Broadcast control:** broadcast traffic stays inside its own segment instead of flooding the whole network.
- **Quality of service:** VoIP and camera traffic get priority separate from user downloads.
- **Clearer monitoring:** when something breaks you know which segment to inspect, not which of 200 devices.

## A suggested design

| Segment | VLAN | Purpose |
|---|---|---|
| Management | 10 | Router, switches, access points |
| Users | 20 | Staff workstations |
| Cameras | 30 | IP cameras and the recorder |
| Guests | 40 | Visitor Wi-Fi — internet only |
| Voice | 50 | VoIP exchange and handsets |

## Implementing it on RouterOS

First create the bridge with filtering **off**:

\`\`\`
/interface bridge
add name=bridge-main vlan-filtering=no
\`\`\`

Add the ports, giving each access port its segment through \`pvid\`:

\`\`\`
/interface bridge port
add bridge=bridge-main interface=ether2 pvid=20
add bridge=bridge-main interface=ether3 pvid=30
add bridge=bridge-main interface=ether4 pvid=40
add bridge=bridge-main interface=ether5 pvid=50
add bridge=bridge-main interface=sfp-sfpplus1
\`\`\`

That last port is the trunk toward the switch, which is why it carries no \`pvid\`.

Declare the VLANs and say which ports carry them tagged:

\`\`\`
/interface bridge vlan
add bridge=bridge-main vlan-ids=10 tagged=bridge-main,sfp-sfpplus1
add bridge=bridge-main vlan-ids=20 tagged=bridge-main,sfp-sfpplus1 untagged=ether2
add bridge=bridge-main vlan-ids=30 tagged=bridge-main,sfp-sfpplus1 untagged=ether3
add bridge=bridge-main vlan-ids=40 tagged=bridge-main,sfp-sfpplus1 untagged=ether4
add bridge=bridge-main vlan-ids=50 tagged=bridge-main,sfp-sfpplus1 untagged=ether5
\`\`\`

Note \`bridge-main\` itself in the \`tagged\` list. That is what lets the router hold an address inside each segment — omitting it is a very common cause of a network where devices reach each other but have no gateway.

Then the VLAN interfaces and their addresses:

\`\`\`
/interface vlan
add interface=bridge-main name=vlan20-users vlan-id=20
add interface=bridge-main name=vlan30-cctv  vlan-id=30
add interface=bridge-main name=vlan40-guest vlan-id=40

/ip address
add address=10.0.20.1/24 interface=vlan20-users
add address=10.0.30.1/24 interface=vlan30-cctv
add address=10.0.40.1/24 interface=vlan40-guest
\`\`\`

## The step that locks you out

Enabling filtering comes **last**, and only after confirming your management port is configured:

\`\`\`
/interface bridge set bridge-main vlan-filtering=yes
\`\`\`

The moment that line runs, the bridge starts enforcing the VLAN table literally. If the machine you administer the router from sits on a port without the right \`pvid\`, or you left \`bridge-main\` out of a \`tagged\` list, your session drops instantly and the only way back is the serial console or a factory reset.

> Before running that last line, schedule a reboot five minutes out with \`/system scheduler\`, or run the command with safe mode enabled in Winbox (Ctrl+X). If the connection drops, the router rolls the change back by itself.

## Isolation between segments

Segmentation alone does not stop traffic between segments — the router routes between its own interfaces by default. Isolation needs explicit firewall rules:

\`\`\`
/ip firewall filter
add chain=forward action=accept connection-state=established,related
add chain=forward action=drop in-interface=vlan40-guest out-interface=vlan20-users
add chain=forward action=drop in-interface=vlan40-guest out-interface=vlan30-cctv
add chain=forward action=drop in-interface=vlan20-users out-interface=vlan30-cctv
\`\`\`

The first rule is essential: without it, replies to permitted connections get dropped.

## A note on hardware

Not every MikroTik device handles VLAN filtering in hardware. Models built on switch chips such as the CRS3xx do it at line rate; smaller models process it on the CPU, which shows up as high CPU load and noticeable latency under traffic. Check the feature table for your model before committing to a VLAN-heavy design.`,
  },

  {
    key: 'cctv',
    titleAr: 'حساب سعة التخزين والنطاق قبل تركيب نظام كاميرات IP',
    titleEn: 'Sizing Storage and Bandwidth Before Installing an IP Camera System',
    excerptAr: 'أكثر أنظمة المراقبة التي نُستدعى لإصلاحها لم تفشل في التركيب، بل في الحساب: قرص لا يكفي أسبوعاً، أو شبكة تتعثّر عند فتح البث. المعادلات والأرقام التي تُقرّر العتاد قبل شرائه.',
    excerptEn: 'Most camera systems we are called to fix did not fail at installation — they failed at arithmetic: a disk that holds a week, or a network that stalls when someone opens a live view. The formulas that decide the hardware before you buy it.',
    contentAr: `العميل يطلب "نظام كاميرات، 16 كاميرا، تسجيل شهر". السؤال الذي يُقرّر نجاح التركيب من فشله ليس أي كاميرا نشتري، بل: هل القرص يكفي فعلاً شهراً؟ وهل الشبكة تحمل 16 بثاً؟

هذه الحسابات تُعمل على الورق قبل طلب العتاد، لا بعد التركيب.

## معادلة التخزين

حجم التسجيل اليومي لكاميرا واحدة:

\`\`\`
GB/يوم = معدل البت (Mbps) ÷ 8 × 86400 ÷ 1024
\`\`\`

القسمة على 8 تُحوّل من بت إلى بايت، و86400 هي ثواني اليوم.

مثال عملي: كاميرا 4MP بترميز H.264 على 4 Mbps:

\`\`\`
4 ÷ 8 = 0.5 MB/s
0.5 × 86400 = 43200 MB = 42.2 GB/يوم
\`\`\`

لستة عشر كاميرا على مدى ثلاثين يوماً:

\`\`\`
42.2 × 16 × 30 = 20256 GB ≈ 19.8 TB
\`\`\`

أي أن "16 كاميرا وشهر تسجيل" يعني قرصين بسعة 12TB على الأقل — لا قرص 4TB كما يُقترح في كثير من العروض.

## ما يُغيّر الرقم جوهرياً

- **الترميز:** H.265 يُنتج نحو نصف حجم H.264 لنفس الجودة. نفس المثال أعلاه يصبح ~10TB. لكن تأكّد أن المسجّل والكاميرات تدعمه معاً — وأن الحاسب الذي سيُراجع التسجيلات يستطيع فك ترميزه.
- **التسجيل عند الحركة:** يُقلّل الحجم بنسبة تتراوح بين 40% و70% حسب الموقع. لكنه غير مناسب للمداخل ومناطق الصرف، حيث تريد تسجيلاً متصلاً.
- **معدل الإطارات:** النزول من 25 إلى 12 إطاراً في الثانية يوفّر نحو النصف، ويبقى كافياً لأغلب أغراض المراقبة.
- **معدل البت المتغيّر (VBR):** يعطي حجماً أقل في المتوسط، لكنه يجعل الحساب تقديرياً. للتخطيط استخدم الحد الأعلى المعلن.

## معادلة النطاق

هنا يُخطئ الكثيرون: النطاق المطلوب ليس واحداً، بل اثنان.

**من الكاميرات إلى المسجّل** — مستمر، ويساوي مجموع معدلات البت:

\`\`\`
16 × 4 Mbps = 64 Mbps
\`\`\`

هذا يمرّ على السويتش الذي يجمع الكاميرات. سويتش 100Mbps نظرياً يكفي، عملياً لا — لأن الأحمال تتزامن والسويتش يعمل قرب سقفه. استخدم Gigabit، ودائماً.

**من المسجّل إلى المشاهد البعيد** — عند فتح التطبيق على الهاتف:

\`\`\`
بث فرعي واحد (substream) ≈ 0.5 – 1 Mbps
شاشة 9 كاميرات ≈ 4.5 – 9 Mbps رفع
\`\`\`

الرقم المهم هنا هو **الرفع** (upload) في اشتراك الموقع، لا التنزيل. اشتراك بـ 20 Mbps تنزيل و 2 Mbps رفع لن يعرض تسع كاميرات مهما كان العتاد جيداً. وهذا بالضبط سبب أغلب شكاوى "الكاميرات تتقطّع على الجوال".

> اضبط دائماً البث الفرعي على دقة منخفضة (D1 أو 640×480) ومعدل بت منخفض، واترك البث الرئيسي للتسجيل المحلي. المشاهدة البعيدة لا تحتاج 4MP.

## تغذية PoE

الميزانية التي تُنسى. كل كاميرا 4MP ثابتة تستهلك 4 إلى 8 واط؛ الكاميرات الدوارة (PTZ) والمزوّدة بإضاءة قوية تصل إلى 25 واط أو أكثر.

\`\`\`
16 × 8 = 128 واط
\`\`\`

سويتش PoE بميزانية 150 واط يبدو كافياً — إلى أن تُضاف كاميرا PTZ واحدة فتتجاوز السقف، وتبدأ الكاميرات في إعادة التشغيل عشوائياً. اختر ميزانية أعلى من الحساب بنسبة 30% على الأقل.

احسب أيضاً طول الكابل: معيار Ethernet يسمح بمئة متر، وبعدها تحتاج مكرّراً أو محوّلاً ضوئياً — لا كابلاً أطول.

## الأقراص

الأقراص المكتبية العادية غير مصمّمة لكتابة متصلة على مدار الساعة. استخدم أقراصاً مخصّصة للمراقبة (بتصنيف يذكر حمل عمل سنوياً بالتيرابايت ودعم عدد أقراص في الهيكل الواحد). قرص مكتبي في مسجّل يعمل 24/7 يُعطي عادة أقل من سنتين.

وإن كان التسجيل يخدم غرضاً قانونياً أو تأمينياً، فاحسب نسخة احتياطية منفصلة: قرص واحد يعني نقطة فشل واحدة تمحو الشهر كله.`,
    contentEn: `A client asks for "a camera system, 16 cameras, one month of recording". The question that decides whether the installation succeeds is not which camera to buy, but: does the disk actually hold a month? And can the network carry 16 streams?

These calculations belong on paper before the hardware is ordered, not after it is mounted.

## The storage formula

Daily recording volume for one camera:

\`\`\`
GB/day = bitrate (Mbps) ÷ 8 × 86400 ÷ 1024
\`\`\`

Dividing by 8 converts bits to bytes; 86400 is the seconds in a day.

A worked example — a 4MP camera using H.264 at 4 Mbps:

\`\`\`
4 ÷ 8 = 0.5 MB/s
0.5 × 86400 = 43200 MB = 42.2 GB/day
\`\`\`

For sixteen cameras over thirty days:

\`\`\`
42.2 × 16 × 30 = 20256 GB ≈ 19.8 TB
\`\`\`

So "16 cameras, one month" means at least two 12TB disks — not the 4TB disk many quotes propose.

## What changes the number materially

- **Codec:** H.265 produces roughly half the size of H.264 at the same quality. The example above becomes ~10TB. Confirm the recorder and the cameras both support it — and that the machine reviewing footage can decode it.
- **Motion-triggered recording:** cuts volume by 40–70% depending on the location. It is the wrong choice for entrances and cash areas, where you want continuous coverage.
- **Frame rate:** dropping from 25 to 12 fps saves about half and remains adequate for most surveillance purposes.
- **Variable bitrate:** gives a smaller average, but makes the estimate approximate. For planning, use the stated ceiling.

## The bandwidth formula

This is where the common mistake sits: there is not one bandwidth requirement, there are two.

**Cameras to recorder** — continuous, and equal to the sum of the bitrates:

\`\`\`
16 × 4 Mbps = 64 Mbps
\`\`\`

That crosses the switch aggregating the cameras. A 100Mbps switch is theoretically enough and practically not — loads coincide and the switch runs near its ceiling. Use Gigabit, always.

**Recorder to a remote viewer** — when the phone app opens:

\`\`\`
one substream ≈ 0.5 – 1 Mbps
a 9-camera view ≈ 4.5 – 9 Mbps of upload
\`\`\`

The number that matters is the site's **upload**, not its download. A 20 Mbps down / 2 Mbps up connection will not show nine cameras however good the hardware is. That is precisely the cause of most "the cameras stutter on mobile" complaints.

> Always set the substream to a low resolution (D1 or 640×480) and a low bitrate, and keep the main stream for local recording. Remote viewing does not need 4MP.

## PoE budget

The budget everyone forgets. A fixed 4MP camera draws 4 to 8 watts; PTZ cameras and those with strong illuminators reach 25 watts or more.

\`\`\`
16 × 8 = 128 watts
\`\`\`

A PoE switch with a 150W budget looks sufficient — until one PTZ camera is added, the ceiling is crossed, and cameras start rebooting at random. Choose a budget at least 30% above the calculation.

Account for cable length too: Ethernet allows one hundred metres, beyond which you need a repeater or a fibre converter — not a longer cable.

## Disks

Ordinary desktop drives are not designed for continuous round-the-clock writing. Use surveillance-rated drives (rated with an annual workload in TB and a supported bay count). A desktop drive in a 24/7 recorder typically gives under two years.

And if the footage serves a legal or insurance purpose, budget for a separate backup: a single disk is a single point of failure that erases the entire month.`,
  },

  {
    key: 'laravel',
    titleAr: 'تأمين واجهات Laravel API: ما يجب إعداده قبل النشر',
    titleEn: 'Securing a Laravel API: What to Configure Before You Ship',
    excerptAr: 'واجهة برمجية تعمل ليست واجهة آمنة. ست نقاط يُغفل عنها في أغلب مشاريع Laravel التي نراجعها — من التحقق من المدخلات إلى تحديد المعدل ومنع الإسناد الجماعي.',
    excerptEn: 'A working API is not a secure API. Six things missed in most Laravel projects we review — from input validation to rate limiting and mass assignment.',
    contentAr: `عندما نُراجع مشروع Laravel قبل نشره، الأعطال التي نجدها متكرّرة بشكل لافت. الواجهة تعمل، والاختبارات اليدوية تمرّ، لكن الطبقة الأمنية إمّا ناقصة أو معطّلة بإعداد واحد خاطئ. هذه أكثر ست نقاط نكتبها في تقارير المراجعة.

## 1. المصادقة: Sanctum لا رموز يدوية

Laravel Sanctum يكفي لأغلب الحالات، وهو أبسط من JWT وأسهل في الإبطال. الخطأ الشائع هو إصدار رمز بلا صلاحيات وبلا انتهاء:

\`\`\`php
// ضعيف: رمز دائم بكل الصلاحيات
$token = $user->createToken('api')->plainTextToken;

// أفضل: صلاحيات محدّدة وانتهاء صريح
$token = $user->createToken('mobile-app', ['posts:read', 'posts:write'],
    now()->addDays(30))->plainTextToken;
\`\`\`

ثم تُفحص الصلاحية في المسار:

\`\`\`php
Route::middleware(['auth:sanctum', 'ability:posts:write'])
    ->post('/posts', [PostController::class, 'store']);
\`\`\`

واضبط \`expiration\` في \`config/sanctum.php\`. رمز بلا انتهاء يعني أن تسريباً واحداً يبقى صالحاً للأبد.

## 2. التحقق من المدخلات في طبقة مستقلة

التحقق داخل المتحكّم يتضخّم ويُنسى. استخدم Form Request:

\`\`\`php
class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title'   => ['required', 'string', 'max:255'],
            'slug'    => ['required', 'alpha_dash', 'max:255', 'unique:posts,slug'],
            'content' => ['required', 'string', 'max:50000'],
            'status'  => ['required', Rule::in(['draft', 'published'])],
        ];
    }
}
\`\`\`

لاحظ \`max\` على الحقول النصية. غيابه يسمح برفع حقل بحجم ميغابايتات — وهو أبسط طريقة لإتعاب قاعدة البيانات.

## 3. الإسناد الجماعي

هذا أخطر سطر يمكن كتابته في موديل:

\`\`\`php
protected $guarded = [];   // كل حقل قابل للتعبئة
\`\`\`

مع هذا الإعداد، طلب يحتوي \`{"name":"...","is_admin":true}\` يرفع صاحبه إلى مدير إن كان العمود موجوداً. حدّد \`$fillable\` صراحةً:

\`\`\`php
protected $fillable = ['title', 'slug', 'content', 'status'];
\`\`\`

ولا تُمرّر \`$request->all()\` أبداً إلى \`create\` أو \`update\` — مرّر \`$request->validated()\`.

## 4. تحديد المعدل

Laravel يضع حدّاً افتراضياً على مجموعة \`api\`، لكنه عام. المسارات الحسّاسة تحتاج حدّاً أضيق بكثير:

\`\`\`php
// في AppServiceProvider
RateLimiter::for('login', fn (Request $r) =>
    Limit::perMinute(5)->by($r->input('email') . '|' . $r->ip())
);

RateLimiter::for('contact', fn (Request $r) =>
    Limit::perMinute(3)->by($r->ip())
);
\`\`\`

\`\`\`php
Route::middleware('throttle:login')->post('/login', ...);
Route::middleware('throttle:contact')->post('/contact', ...);
\`\`\`

الربط بالبريد **و** عنوان IP معاً يمنع تجربة كلمات مرور كثيرة على حساب واحد، ويمنع كذلك توزيع المحاولات على حسابات كثيرة من عنوان واحد.

نموذج تواصل بلا تحديد معدل يعني أن صندوق بريدك مسألة وقت.

## 5. إظهار ما يلزم فقط

إرجاع الموديل كما هو يُسرّب أعمدة لم تقصد إظهارها:

\`\`\`php
return response()->json($user);   // قد يحمل حقولاً داخلية
\`\`\`

استخدم API Resource:

\`\`\`php
class PostResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'      => $this->id,
            'title'   => $this->title,
            'slug'    => $this->slug,
            'excerpt' => $this->excerpt,
            'views'   => $this->views,
        ];
    }
}
\`\`\`

هذا يضبط أيضاً شكل الاستجابة، فلا تتغيّر بنية الـ JSON كلما أُضيف عمود في الجدول.

## 6. الإعداد قبل النشر

\`\`\`
APP_DEBUG=false
APP_ENV=production
\`\`\`

\`APP_DEBUG=true\` على خادم منشور يعرض صفحة خطأ تحتوي مسارات الملفات، وأجزاءً من الإعدادات، وأحياناً بيانات الاتصال بقاعدة البيانات. وهو أكثر ما نجده مفتوحاً في المشاريع المنقولة للإنتاج على عجل.

واضبط \`config/cors.php\` على النطاقات المسموح بها صراحةً:

\`\`\`php
'allowed_origins' => ['https://example.com'],
\`\`\`

لا \`['*']\` مع اعتماد مصادقة بالكوكيز.

> شغّل \`php artisan config:cache\` و \`route:cache\` في الإنتاج. الفائدة في الأداء واضحة، لكن الأهم أن أي متغيّر بيئة ناقص يظهر عند التنفيذ فوراً لا عند أول طلب من مستخدم.

## خلاصة

لا شيء في هذه القائمة يحتاج حزمة إضافية أو إعادة بناء. كلها موجودة في Laravel افتراضياً، وتُغفل لأن الواجهة تعمل بدونها. الفرق بين واجهة تعمل وواجهة جاهزة للنشر هو هذه الإعدادات الستة.`,
    contentEn: `When we review a Laravel project before it ships, the findings repeat with striking regularity. The API works, manual testing passes, but the security layer is either absent or disabled by one wrong setting. These are the six items that appear most often in our review reports.

## 1. Authentication: Sanctum, not hand-rolled tokens

Laravel Sanctum is enough for most cases, simpler than JWT and easier to revoke. The common mistake is issuing a token with no abilities and no expiry:

\`\`\`php
// Weak: a permanent token with every permission
$token = $user->createToken('api')->plainTextToken;

// Better: scoped abilities and an explicit expiry
$token = $user->createToken('mobile-app', ['posts:read', 'posts:write'],
    now()->addDays(30))->plainTextToken;
\`\`\`

Then check the ability on the route:

\`\`\`php
Route::middleware(['auth:sanctum', 'ability:posts:write'])
    ->post('/posts', [PostController::class, 'store']);
\`\`\`

And set \`expiration\` in \`config/sanctum.php\`. A token that never expires means one leak stays valid forever.

## 2. Validation in its own layer

Validation inside the controller grows and gets forgotten. Use a Form Request:

\`\`\`php
class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title'   => ['required', 'string', 'max:255'],
            'slug'    => ['required', 'alpha_dash', 'max:255', 'unique:posts,slug'],
            'content' => ['required', 'string', 'max:50000'],
            'status'  => ['required', Rule::in(['draft', 'published'])],
        ];
    }
}
\`\`\`

Note \`max\` on the text fields. Without it, a request can submit a field megabytes long — the simplest way to exhaust a database.

## 3. Mass assignment

This is the most dangerous line you can write in a model:

\`\`\`php
protected $guarded = [];   // every column is fillable
\`\`\`

With that setting, a request carrying \`{"name":"...","is_admin":true}\` promotes its sender to administrator if the column exists. Declare \`$fillable\` explicitly:

\`\`\`php
protected $fillable = ['title', 'slug', 'content', 'status'];
\`\`\`

And never pass \`$request->all()\` into \`create\` or \`update\` — pass \`$request->validated()\`.

## 4. Rate limiting

Laravel applies a default limit to the \`api\` group, but it is generic. Sensitive routes need a far tighter one:

\`\`\`php
// in AppServiceProvider
RateLimiter::for('login', fn (Request $r) =>
    Limit::perMinute(5)->by($r->input('email') . '|' . $r->ip())
);

RateLimiter::for('contact', fn (Request $r) =>
    Limit::perMinute(3)->by($r->ip())
);
\`\`\`

\`\`\`php
Route::middleware('throttle:login')->post('/login', ...);
Route::middleware('throttle:contact')->post('/contact', ...);
\`\`\`

Keying on the email **and** the IP together stops many password attempts against one account, and equally stops attempts spread across many accounts from one address.

A contact form with no rate limit makes your inbox a matter of time.

## 5. Expose only what you mean to

Returning the model as-is leaks columns you never intended to publish:

\`\`\`php
return response()->json($user);   // may carry internal fields
\`\`\`

Use an API Resource:

\`\`\`php
class PostResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'      => $this->id,
            'title'   => $this->title,
            'slug'    => $this->slug,
            'excerpt' => $this->excerpt,
            'views'   => $this->views,
        ];
    }
}
\`\`\`

This also pins the response shape, so the JSON structure does not shift every time a column is added to the table.

## 6. Configuration before shipping

\`\`\`
APP_DEBUG=false
APP_ENV=production
\`\`\`

\`APP_DEBUG=true\` on a deployed server renders an error page containing file paths, fragments of configuration, and sometimes database credentials. It is the single thing we most often find left open on projects rushed into production.

Set \`config/cors.php\` to the permitted origins explicitly:

\`\`\`php
'allowed_origins' => ['https://example.com'],
\`\`\`

Not \`['*']\` alongside cookie-based authentication.

> Run \`php artisan config:cache\` and \`route:cache\` in production. The performance gain is real, but the bigger benefit is that a missing environment variable surfaces at deploy time rather than on a user's first request.

## In short

Nothing on this list needs an extra package or a rewrite. All of it ships with Laravel by default and gets skipped because the API works without it. The difference between an API that works and one that is ready to ship is these six settings.`,
  },
];
