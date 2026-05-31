import { Eyebrow, Panel } from "../components/ui";

export default function AboutPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-stone-100 p-7">
      <Panel className="w-full max-w-[720px] p-7">
        <Eyebrow>About BOK³</Eyebrow>
        <h1 className="mt-2.5 mb-4 text-[clamp(40px,7vw,72px)] leading-[0.94] font-black">
          Printed things worth digging for.
        </h1>
        <p className="max-w-[42ch] leading-[1.55]">
          BOK³ is a Seoul-based zine shop for personal publishing, quiet collections, and small
          printed objects that reward slow browsing.
        </p>
        <a href="https://www.instagram.com/bok3books/">인스타그램</a>
      </Panel>
    </main>
  );
}
