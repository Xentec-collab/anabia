import Link from "next/link";

export default function AdminHelpPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/admin"
          className="text-[13px] text-[#8A8780] hover:text-[#1A1A1A] transition-colors"
        >
          ← Back to products
        </Link>
      </div>

      <div className="bg-white border border-[#E5E4E0] p-8 shadow-sm">
        <h1 className="font-serif text-[28px] text-[#1A1A1A] mb-2 tracking-tight">
          How to Upload Product Photos
        </h1>
        <p className="text-[14px] text-[#66645E] mb-8 leading-relaxed">
          Anabia supports direct high-resolution image links hosted for free via{" "}
          <a
            href="https://imgbb.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#1A1A1A] font-medium underline underline-offset-2 hover:opacity-80"
          >
            imgbb.com
          </a>
          . Follow this step-by-step guide to add photos to your catalog without writing any code.
        </p>

        {/* Steps */}
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white text-[12px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </span>
            <div>
              <h2 className="text-[14px] font-medium text-[#1A1A1A]">
                Visit ImgBB
              </h2>
              <p className="text-[13px] text-[#66645E] mt-1">
                Go to{" "}
                <a
                  href="https://imgbb.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1A1A1A] underline underline-offset-2"
                >
                  imgbb.com
                </a>{" "}
                in your desktop or mobile browser.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white text-[12px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </span>
            <div>
              <h2 className="text-[14px] font-medium text-[#1A1A1A]">
                Click 'Start Uploading'
              </h2>
              <p className="text-[13px] text-[#66645E] mt-1">
                Tap or click the blue <strong>"Start uploading"</strong> button on the homepage.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white text-[12px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </span>
            <div>
              <h2 className="text-[14px] font-medium text-[#1A1A1A]">
                Choose Your Product Photo
              </h2>
              <p className="text-[13px] text-[#66645E] mt-1">
                Select your product picture from your computer, gallery, or mobile camera.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white text-[12px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
              4
            </span>
            <div>
              <h2 className="text-[14px] font-medium text-[#1A1A1A]">
                Upload The Image
              </h2>
              <p className="text-[13px] text-[#66645E] mt-1">
                Click <strong>"Upload"</strong>. It takes just a few seconds.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-emerald-50/70 p-4 border border-emerald-200">
            <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white text-[12px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
              5
            </span>
            <div>
              <h2 className="text-[14px] font-semibold text-[#1A1A1A]">
                Copy Your Image Link (3 Easy Ways)
              </h2>
              <p className="text-[13px] text-[#66645E] mt-1 leading-relaxed">
                ImgBB gives you multiple ways to copy your photo. You can use any of them:
              </p>
              <div className="mt-3 p-3.5 bg-white border border-[#E5E4E0] text-[12px] space-y-2">
                <div>
                  <span className="font-bold text-emerald-800">Option 1 (Easiest):</span>
                  <p className="text-[#66645E] mt-0.5">
                    Just copy the link already in the box (e.g. <code>https://ibb.co/fGTVjCN8</code>). Anabia automatically converts it into the real image file for you!
                  </p>
                </div>
                <div className="pt-1 border-t border-[#F2F1EF]">
                  <span className="font-bold text-emerald-800">Option 2 (Direct):</span>
                  <p className="text-[#66645E] mt-0.5">
                    Right-click the picture shown on the ImgBB screen and click <strong>"Copy image address"</strong> (or "Copy image link").
                  </p>
                </div>
                <div className="pt-1 border-t border-[#F2F1EF]">
                  <span className="font-bold text-emerald-800">Option 3 (Embed code):</span>
                  <p className="text-[#66645E] mt-0.5">
                    In the dropdown, select <strong>"HTML full linked"</strong> and copy the code. Anabia automatically extracts the image link from it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white text-[12px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
              6
            </span>
            <div>
              <h2 className="text-[14px] font-medium text-[#1A1A1A]">
                Paste into Anabia Admin & Save
              </h2>
              <p className="text-[13px] text-[#66645E] mt-1">
                Paste the link or code into the <strong>Image URL</strong> field when adding or editing a product. The preview will load immediately, and you can click <strong>Save Product</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Tip Banner */}
        <div className="mt-8 p-4 bg-[#F2F1EF] border border-[#E5E4E0] text-[13px] text-[#1A1A1A]">
          <p className="font-medium">💡 Good to know:</p>
          <p className="mt-1 text-[#66645E]">
            No account is required on ImgBB. Your uploaded photos remain online permanently and are served through high-speed content delivery networks.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-6 border-t border-[#E5E4E0] flex justify-end">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center h-11 px-6 bg-[#1A1A1A] text-white text-[13px] font-medium uppercase tracking-wider hover:bg-black transition-all"
          >
            Add a Product Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
