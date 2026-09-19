import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology · Deskmeter",
  description:
    "How Deskmeter processes the ticket CSV, redacts personal data, classifies with classifier.dev and computes the health index.",
};

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-8 pt-8 sm:px-6">
      <nav className="mb-6 text-xs text-foreground/60" aria-label="Breadcrumb">
        <Link href="/en" className="underline underline-offset-2 hover:text-foreground">
          Dashboard
        </Link>
        <span className="mx-1.5">/</span>
        <span>Methodology</span>
      </nav>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Methodology
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Where every number comes from, how it is computed and what should not
          be read into it.
        </p>
      </header>

      <section className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-foreground/80">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            What Deskmeter is
          </h2>
          <p className="mt-2">
            A dashboard to look at a helpdesk&apos;s health from its exported
            ticket CSV. There is no account, no API key and no database: the CSV
            is processed in the browser, classification is requested from
            classifier.dev and nothing is stored on the server.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            How it differs from an enterprise panel
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Instant and public</strong>: open the URL and the
              dashboard is ready in seconds. No sales demo, no contact form, no
              24-48 hour wait.
            </li>
            <li>
              <strong>No backend, no retention</strong>: the CSV is never
              uploaded to a server or saved in a database (some dashboards keep
              the export for up to 30 days). Only the redacted text of each
              ticket travels to classifier.dev, and it is not stored.
            </li>
            <li>
              <strong>Open methodology</strong>: the health index is not a
              closed report; its weights, thresholds and limits are published
              here and the computation lives in{" "}
              <code>lib/tickets/indice.ts</code>.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Input: the CSV
          </h2>
          <p className="mt-2">
            Required columns are <code>fecha</code>, <code>asunto</code> and{" "}
            <code>descripcion</code>. Optional: <code>estado</code>,{" "}
            <code>prioridad</code> and <code>tiempo_resolucion_horas</code>.
            Headers are normalised (accents, case and separators do not matter)
            and usual aliases such as <code>date</code> or <code>subject</code>{" "}
            are accepted. Dates are read as ISO (2026-09-18) or Spanish format
            (18/09/2026, 18-09-2026). Rows with an invalid date are dropped and
            counted.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Personal data redaction
          </h2>
          <p className="mt-2">
            Before anything is sent to classifier.dev, the text (subject +
            description) goes through regular expressions that replace emails,
            phones and Spanish ID numbers (DNI/NIE) with{" "}
            <code>[EMAIL]</code>, <code>[PHONE]</code> and <code>[ID]</code>.
            The text is concatenated, whitespace is collapsed and it is
            truncated to about 500 characters. The original CSV never leaves
            the browser; only that redacted text travels.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Classification with classifier.dev
          </h2>
          <p className="mt-2">
            Each ticket is classified in two independent passes, each with its
            own label set:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Category</strong>: hardware, software, networking,
              accounts &amp; access, billing or other.
            </li>
            <li>
              <strong>Urgency</strong>: critical, high, normal or low.
            </li>
          </ul>
          <p className="mt-2">
            Requests are grouped in batches of up to 1000 tickets (the API
            maximum), with at most two in flight, and rate limits (429) and
            provider failures are retried honouring <code>Retry-After</code>.
            The default tier is <code>fast</code>, a single pass of the
            decision model; <code>smart</code> re-asks answers below 0.7
            confidence and takes longer. Each pass keeps the chosen label and
            its calibrated confidence.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Manual review
          </h2>
          <p className="mt-2">
            A ticket is flagged for manual review when the confidence of either
            dimension is below <strong>0.7</strong>, when classifier.dev returns
            it as <code>null</code> (text that does not read as natural
            language) or when the label does not fit the taxonomy. It is the
            same criterion as the <code>--review 0.7</code> flag of the
            classifier.dev CLI. The review table shows the reason and the
            confidence of each dimension.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Aggregation by week and month
          </h2>
          <p className="mt-2">
            Weeks are ISO weeks (Monday to Sunday, <code>2026-W38</code>) and
            months are calendar months. For each period the dashboard computes
            the category histogram, the share of critical and high tickets, the
            share under manual review and the average resolution time (only if
            the column exists; the average uses the tickets that carry a
            value).
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Health index (0–100)
          </h2>
          <p className="mt-2">
            The index summarises each period as a score from 0 to 100, where{" "}
            <strong>100 is the best health</strong>. It weighs four components:
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-borde uppercase tracking-wide text-foreground/50">
                  <th className="py-2 pr-3 font-medium">Component</th>
                  <th className="py-2 pr-3 font-medium">Weight</th>
                  <th className="py-2 pr-3 font-medium">Normalisation</th>
                  <th className="py-2 pr-3 font-medium">Better when…</th>
                </tr>
              </thead>
              <tbody className="text-foreground/80">
                <tr className="border-b border-borde/60">
                  <td className="py-2 pr-3">Total volume</td>
                  <td className="py-2 pr-3 tabular-nums">20 %</td>
                  <td className="py-2 pr-3">
                    inverted min-max across periods
                  </td>
                  <td className="py-2 pr-3">fewer tickets</td>
                </tr>
                <tr className="border-b border-borde/60">
                  <td className="py-2 pr-3">% critical / high</td>
                  <td className="py-2 pr-3 tabular-nums">40 %</td>
                  <td className="py-2 pr-3">1 − percentage / 100</td>
                  <td className="py-2 pr-3">fewer critical</td>
                </tr>
                <tr className="border-b border-borde/60">
                  <td className="py-2 pr-3">% manual review</td>
                  <td className="py-2 pr-3 tabular-nums">20 %</td>
                  <td className="py-2 pr-3">1 − percentage / 100</td>
                  <td className="py-2 pr-3">less review</td>
                </tr>
                <tr className="border-b border-borde/60">
                  <td className="py-2 pr-3">Average resolution time</td>
                  <td className="py-2 pr-3 tabular-nums">20 %</td>
                  <td className="py-2 pr-3">
                    inverted min-max across periods
                  </td>
                  <td className="py-2 pr-3">fewer hours</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Volume and time are normalised with the minimum and maximum across
            the periods present in the data; the score is relative to the series
            you are looking at, not an absolute value. If there is no{" "}
            <code>tiempo_resolucion_horas</code> column (or no ticket carries a
            value), that component disappears and the weights are renormalised
            across the available ones. With a single period there is no
            reference for the minimum and maximum, so volume and time are 0.5
            (neutral) and the index is determined by the percentages.
          </p>
          <p className="mt-2">
            The version of the computation lives in{" "}
            <code>lib/tickets/indice.ts</code> and the weights are explicit
            constants (<code>PESOS_INDICE</code>), so anyone can review or
            challenge them.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Demo data
          </h2>
          <p className="mt-2">
            Demo mode generates synthetic tickets in the browser with a
            simulated classification (including low confidences and texts with
            fake personal data) so the dashboard can be seen without uploading
            anything or calling any API. It is not a real sample from any
            organisation.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Known limits
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Confidence is a calibrated forecast that the label is right, not a
              measure of whether the ticket fits the taxonomy: a ticket that is
              none of the six types will land in &ldquo;other&rdquo; with
              whatever confidence it gets.
            </li>
            <li>
              The classifier.dev free tier allows 3,000 classifications per
              minute and 20,000 per day per IP; a ticket consumes two. The CSV
              accepts up to 5,000 rows so the shared quota is not exhausted.
            </li>
            <li>
              The index is an editorial metric of this project: it mixes volume,
              urgency, classifier confidence and time, and it is not official
              data from any helpdesk tool.
            </li>
            <li>
              PII redaction uses simple regular expressions: it reduces risk but
              it is not a complete anonymiser. Do not upload CSVs with sensitive
              data you would not want to send to a third party.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Privacy</h2>
          <p className="mt-2">
            There is no stateful backend: the API route only forwards the
            redacted texts to classifier.dev and returns the response.
            classifier.dev asks for no key or account and states that it does
            not store the submitted text. The full CSV stays in your browser and
            disappears when you reload the page.
          </p>
        </div>
      </section>

      <footer className="mt-10 border-t border-borde pt-4 text-xs text-foreground/60">
        <Link
          href="/en"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Back to the dashboard
        </Link>
      </footer>
    </main>
  );
}
