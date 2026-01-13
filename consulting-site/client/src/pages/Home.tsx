import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Twitter, Facebook } from "lucide-react";

/**
 * Home Page - Tech Minimalism Design
 * 
 * Design Philosophy:
 * - White background with deep navy text (#1A1A2E)
 * - Tech blue accents (#0066FF) for CTAs and highlights
 * - Ample whitespace and clear visual hierarchy
 * - Minimalist, professional aesthetic
 * - SEO-optimized structure with proper H1, H2, H3 tags
 * 
 * Content Strategy:
 * - Hero section with profile summary
 * - Expertise pillars (Technical, Business, Finance)
 * - Vision and challenges (4 pillars)
 * - Track records and achievements
 * - FAQ section
 * - Contact CTA
 */

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#1A1A2E]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E0E0E0]">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1A1A2E]">松田 聡一</h1>
          <div className="flex gap-6">
            <a href="#expertise" className="text-sm font-medium hover:text-[#0066FF] transition">
              専門領域
            </a>
            <a href="#vision" className="text-sm font-medium hover:text-[#0066FF] transition">
              ビジョン
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-[#0066FF] transition">
              お問い合わせ
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-20 lg:py-32">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Profile Image */}
            <div className="flex justify-center">
              <div className="w-64 h-80 bg-gradient-to-br from-[#F5F5F5] to-[#E0E0E0] rounded-lg overflow-hidden border-2 border-[#E0E0E0]">
                <img
                  src="/images/profile-placeholder.png"
                  alt="松田聡一 プロフィール画像"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right: Profile Summary */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-[#1A1A2E] mb-4">
                  松田 聡一
                </h1>
                <p className="text-lg text-[#666666] font-medium">
                  AI・深層学習 技術・経営アドバイザー
                </p>
              </div>

              <p className="text-base leading-relaxed text-[#1A1A2E]">
                深層学習分野における経験豊富な起業家かつ先見性のあるリーダーとして、技術イノベーション推進と国内外200社以上との共同プロジェクトを構築してきました。LeapMind株式会社のCEOとして、超低消費電力AI推論アクセラレータIP「Efficiera」を含む最先端深層学習ソリューションの開発・商用化を主導。TSMC 12nm/28nmでのSoC開発に成功しました。
              </p>

              <p className="text-base leading-relaxed text-[#1A1A2E]">
                2024年に事業売却後、現在は技術・経営アドバイザーとして、民間企業や官公庁に専門知識と経験を提供しています。
              </p>

              <div className="flex gap-4 pt-4">
                <Button
                  asChild
                  className="bg-[#0066FF] hover:bg-[#0052CC] text-white"
                >
                  <a href="#contact">お問い合わせ</a>
                </Button>
                <Button
                  variant="outline"
                  className="border-[#E0E0E0] text-[#1A1A2E] hover:bg-[#F5F5F5]"
                  asChild
                >
                  <a href="#expertise">詳しく見る</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-[#E0E0E0]" />

      {/* Expertise Section */}
      <section id="expertise" className="py-20 lg:py-32 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1A1A2E] mb-16 text-center">
            専門領域と強み
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Technical */}
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <img
                  src="/images/expertise-visual.png"
                  alt="専門領域"
                  className="w-full max-w-sm"
                />
              </div>
            </div>
          </div>

          {/* Expertise Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Technical */}
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-4">テクニカル</h3>
              <ul className="space-y-3 text-[#1A1A2E]">
                <li className="flex gap-3">
                  <span className="text-[#0066FF] font-bold">•</span>
                  <span>深層学習ネットワーク設計</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#0066FF] font-bold">•</span>
                  <span>AI推論アクセラレータ HW設計（TSMC 12nm/28nm）</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#0066FF] font-bold">•</span>
                  <span>組み込み深層学習実装</span>
                </li>
              </ul>
            </div>

            {/* Business */}
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-4">ビジネス</h3>
              <ul className="space-y-3 text-[#1A1A2E]">
                <li className="flex gap-3">
                  <span className="text-[#0066FF] font-bold">•</span>
                  <span>ビジネス戦略・市場分析</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#0066FF] font-bold">•</span>
                  <span>プロダクト開発・PdM/PO</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#0066FF] font-bold">•</span>
                  <span>営業・マーケティング戦略</span>
                </li>
              </ul>
            </div>

            {/* Finance & Management */}
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-4">ファイナンス・マネジメント</h3>
              <ul className="space-y-3 text-[#1A1A2E]">
                <li className="flex gap-3">
                  <span className="text-[#0066FF] font-bold">•</span>
                  <span>資金調達（$45M以上）</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#0066FF] font-bold">•</span>
                  <span>チームリーダーシップ（100名以上）</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#0066FF] font-bold">•</span>
                  <span>経営管理・財務・HR</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-[#E0E0E0]" />

      {/* Vision Section */}
      <section id="vision" className="py-20 lg:py-32 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1A1A2E] mb-16 text-center">
            ビジョンと次なるチャレンジ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision 1 */}
            <div className="bg-[#F5F5F5] p-8 rounded-lg space-y-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">AIで日常を豊かに</h3>
              <p className="text-[#1A1A2E] leading-relaxed">
                最先端技術を活用して、誰もが使える形で社会に届けたい。人々の暮らしや仕事がもっと便利で、創造的になる世界を目指しています。
              </p>
            </div>

            {/* Vision 2 */}
            <div className="bg-[#F5F5F5] p-8 rounded-lg space-y-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">日本初の技術を世界へ</h3>
              <p className="text-[#1A1A2E] leading-relaxed">
                日本には素晴らしい能力を持った人材が数多くいます。その能力を活かした革新的な製品やサービスを世界に広げ、日本の産業界に新たな風を吹き込みたいと考えています。
              </p>
            </div>

            {/* Vision 3 */}
            <div className="bg-[#F5F5F5] p-8 rounded-lg space-y-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">次世代の育成と支援</h3>
              <p className="text-[#1A1A2E] leading-relaxed">
                若い起業家やエンジニアが思い切り挑戦できる環境づくりに力を入れたいです。また、私の経験や失敗談が、次世代の道しるべになれば幸いです。
              </p>
            </div>

            {/* Vision 4 */}
            <div className="bg-[#F5F5F5] p-8 rounded-lg space-y-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">共創のエコシステム構築</h3>
              <p className="text-[#1A1A2E] leading-relaxed">
                一社だけでなく、産官学交えた、様々な企業や組織、個人と協力し合える関係を築きたい。多様な視点と能力が集まることで、より大きな社会的インパクトを生み出せると信じています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-[#E0E0E0]" />

      {/* Track Record Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1A1A2E] mb-16 text-center">
            実績とプロジェクト
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <div className="text-3xl font-bold text-[#0066FF] mb-2">200+</div>
              <p className="text-[#1A1A2E] font-medium">共同プロジェクト</p>
            </div>
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <div className="text-3xl font-bold text-[#0066FF] mb-2">$45M+</div>
              <p className="text-[#1A1A2E] font-medium">資金調達</p>
            </div>
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <div className="text-3xl font-bold text-[#0066FF] mb-2">100+</div>
              <p className="text-[#1A1A2E] font-medium">チーム規模</p>
            </div>
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <div className="text-3xl font-bold text-[#0066FF] mb-2">TSMC</div>
              <p className="text-[#1A1A2E] font-medium">12nm/28nm SoC開発</p>
            </div>
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <div className="text-3xl font-bold text-[#0066FF] mb-2">Efficiera</div>
              <p className="text-[#1A1A2E] font-medium">AI推論アクセラレータ</p>
            </div>
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <div className="text-3xl font-bold text-[#0066FF] mb-2">2024</div>
              <p className="text-[#1A1A2E] font-medium">事業売却</p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-[#E0E0E0]" />

      {/* FAQ Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1A1A2E] mb-16 text-center">
            よくあるご質問
          </h2>

          <div className="space-y-8 max-w-3xl mx-auto">
            {/* FAQ 1 */}
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">
                どのような価値提供が可能ですか？
              </h3>
              <p className="text-[#1A1A2E] leading-relaxed">
                技術戦略相談、ビジネス開発、資金調達支援、チームビルディング、メンタリングなど、深層学習・AI技術の実装から経営戦略まで、幅広い支援が可能です。
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">
                どうやって依頼すればよいですか？
              </h3>
              <p className="text-[#1A1A2E] leading-relaxed">
                メール、LinkedIn、Twitter、Facebookなど、複数の方法でお気軽にお問い合わせください。詳細は下記のお問い合わせセクションをご覧ください。
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-[#F5F5F5] p-8 rounded-lg">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">
                どのような形態での関わり方が可能ですか？
              </h3>
              <p className="text-[#1A1A2E] leading-relaxed">
                スポット相談、継続的なメンタリング、プロジェクト参画、ボードメンバーなど、柔軟に対応可能です。まずはお気軽にご相談ください。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-[#E0E0E0]" />

      {/* Contact Section */}
      <section id="contact" className="py-20 lg:py-32 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1A1A2E]">
              一緒に何か素晴らしいものを作りましょう
            </h2>

            <p className="text-lg text-[#1A1A2E] leading-relaxed">
              AI・深層学習の技術と経営の両面から、あなたのビジョンを実現するお手伝いをします。まずはお気軽にお問い合わせください。
            </p>

            <div className="bg-[#F5F5F5] p-8 rounded-lg space-y-6">
              <div>
                <p className="text-sm text-[#666666] mb-2">メール</p>
                <a
                  href="mailto:s.matsuda0913@gmail.com"
                  className="text-lg font-medium text-[#0066FF] hover:text-[#0052CC] transition flex items-center justify-center gap-2"
                >
                  <Mail size={20} />
                  s.matsuda0913@gmail.com
                </a>
              </div>

              <div className="border-t border-[#E0E0E0] pt-6">
                <p className="text-sm text-[#666666] mb-4">SNS</p>
                <div className="flex justify-center gap-6">
                  <a
                    href="https://www.facebook.com/soichi.matsuda/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0066FF] hover:text-[#0052CC] transition"
                    title="Facebook"
                  >
                    <Facebook size={24} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/soichi-matsuda/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0066FF] hover:text-[#0052CC] transition"
                    title="LinkedIn"
                  >
                    <Linkedin size={24} />
                  </a>
                  <a
                    href="https://twitter.com/mtzd3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0066FF] hover:text-[#0052CC] transition"
                    title="Twitter"
                  >
                    <Twitter size={24} />
                  </a>
                </div>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-base"
            >
              <a href="mailto:s.matsuda0913@gmail.com">メールで相談する</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A2E] text-white py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © 2024 Soichi Matsuda. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
