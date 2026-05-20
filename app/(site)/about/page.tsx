import Image from "next/image";
import { getAboutPage } from "@/services/about.service";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `About Us | ${siteConfig.name}`,
  description: "Learn about WorldView Creative Media and our team.",
};

export default async function AboutPage() {
  const about = await getAboutPage();

  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border bg-[#2E2A86] py-14 text-white lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">{about.headline}</h1>
          <p className="mt-4 text-lg text-white/85">{about.mission}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 lg:px-6 lg:py-16">
        <div className="prose-article whitespace-pre-line text-base leading-relaxed text-foreground-muted">
          {about.description}
        </div>
      </section>

      {about.teamMembers.length > 0 ? (
        <section className="border-t border-border bg-muted/30 py-12 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 lg:px-6">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#2E2A86] dark:text-[#E8872A]">
              Our Team
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {about.teamMembers.map((member) => (
                <article
                  key={member.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm"
                >
                  {member.image ? (
                    <div className="relative aspect-[4/3] w-full bg-muted">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-[#2E2A86]/10 text-4xl font-bold text-[#2E2A86]">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                    <p className="text-sm font-medium text-[#E8872A]">{member.title}</p>
                    {member.bio ? (
                      <p className="mt-2 text-sm text-foreground-muted">{member.bio}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
