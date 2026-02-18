import { Github } from "lucide-react";
import MaxWidthWrapper from "./MaxWidthWrapper";

const SiteFooter = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/70">
      <MaxWidthWrapper className="py-10">
        <div className="grid gap-8 text-center md:grid-cols-3 md:items-start md:text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Contact
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              Reach out by email
            </h2>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <a
                  href="mailto:sebiu.ciobanu98@gmail.com"
                  className="font-semibold text-slate-900 transition hover:text-slate-700"
                >
                  sebiu.ciobanu98@gmail.com
                </a>
              </p>
              <p>
                <a
                  href="mailto:euscio01190@stud.noroff.no"
                  className="font-semibold text-slate-900 transition hover:text-slate-700"
                >
                  euscio01190@stud.noroff.no
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm md:text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              About this project
            </p>
            <p className="mt-3 text-sm text-slate-600">
              BWA Dojo is a student project focused on cybersecurity training
              through a deliberately vulnerable web application.
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-900">
              Built for hands-on learning
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Social
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              Follow the journey
            </h2>
            <div className="mx-auto mt-4 flex max-w-xs justify-center md:ml-auto md:mr-0 md:justify-end">
              <a
                href="https://github.com/Sebiu98"
                className="inline-flex items-center gap-3 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-5 w-5" />
                <span>GitHub @Sebiu98</span>
              </a>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};

export default SiteFooter;
