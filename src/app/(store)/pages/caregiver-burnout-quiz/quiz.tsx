"use client";

import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { TurnstileWidget } from "../../_components/turnstile-widget";
import Link from "next/link";
import { useState } from "react";
import { QUIZ_EMAIL_BOX, QUIZ_INTRO, QUIZ_QUESTIONS, QUIZ_SCALE, QUIZ_SOURCE, resultFor } from "@/lib/burnout-quiz";
import { QUIZ_INTRO_LINE, QUIZ_RESULT_FOOTER } from "@/lib/legal";
import { cn } from "@/lib/utils";
import { eyebrow, pillDark } from "../../_components/ui";

/**
 * The quiz itself. Answers live only in this component's state: nothing is
 * stored (no cookies, no localStorage) or sent anywhere, and the score is
 * worked out here in the browser.
 */
export function BurnoutQuiz() {
	const [answers, setAnswers] = useState<number[] | null>(null);
	const step = answers?.length ?? 0;
	const done = answers !== null && step === QUIZ_QUESTIONS.length;

	if (answers === null) {
		return (
			<div className="grid justify-items-center gap-5 text-center">
				<p className="text-body max-w-[560px] text-[13px] leading-relaxed">{QUIZ_INTRO_LINE}</p>
				<button type="button" className={pillDark} onClick={() => setAnswers([])}>
					{QUIZ_INTRO.button}
				</button>
			</div>
		);
	}

	if (done) {
		const score = answers.reduce((sum, a) => sum + a, 0);
		const result = resultFor(score);
		return (
			<div className="grid gap-6">
				<div className="grid gap-3">
					<p className={`${eyebrow} text-primary`}>Your result</p>
					<h2 className="text-foreground text-[30px] leading-tight font-semibold tracking-[-0.034em] md:text-[35px]">{result.title}</h2>
					<p className="text-body text-[16px] leading-[1.714]">{result.text}</p>
					<p className="text-foreground text-[16px] leading-[1.714] font-medium">
						{result.next.map((s) =>
							s.href ? (
								<Link key={s.text} href={s.href} className="hover:text-primary underline underline-offset-4">
									{s.text}
								</Link>
							) : (
								<span key={s.text}>{s.text}</span>
							),
						)}
					</p>
				</div>
				<p className="border-foreground/15 rounded-[10px] border bg-white p-4 text-[14px] leading-relaxed">{QUIZ_RESULT_FOOTER}</p>
				<EmailBox />
				<button type="button" onClick={() => setAnswers([])} className="text-foreground hover:text-primary inline-flex items-center gap-2 justify-self-start text-sm font-semibold">
					<RotateCcw className="size-4" />
					Take the quiz again
				</button>
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div className="grid gap-2">
				<div className="text-body flex items-center justify-between text-[13px]">
					<span>
						Question {step + 1} of {QUIZ_QUESTIONS.length}
					</span>
					{step > 0 && (
						<button type="button" onClick={() => setAnswers(answers.slice(0, -1))} className="hover:text-foreground inline-flex items-center gap-1">
							<ArrowLeft className="size-3.5" />
							Back
						</button>
					)}
				</div>
				<div className="h-1.5 overflow-hidden rounded-full bg-[#e5e5e5]" role="progressbar" aria-valuemin={0} aria-valuemax={QUIZ_QUESTIONS.length} aria-valuenow={step}>
					<span className="bg-foreground block h-full transition-[width] duration-300" style={{ width: `${(step / QUIZ_QUESTIONS.length) * 100}%` }} />
				</div>
			</div>
			<fieldset className="grid gap-5">
				<legend className="text-foreground mb-5 text-[24px] leading-snug font-semibold tracking-[-0.03em] md:text-[28px]">{QUIZ_QUESTIONS[step]}</legend>
				<div className="grid gap-2.5 sm:grid-cols-2">
					{QUIZ_SCALE.map((option) => (
						<button
							key={option.label}
							type="button"
							onClick={() => setAnswers([...answers, option.value])}
							className="text-foreground hover:border-foreground hover:bg-foreground flex h-[50px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[15px] font-semibold transition-colors hover:text-white"
						>
							{option.label}
						</button>
					))}
				</div>
			</fieldset>
		</div>
	);
}

/** "Email me my result": sends only the email address (the same plans email for every band). */
function EmailBox() {
	const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
	const [error, setError] = useState<string | null>(null);

	async function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setState("sending");
		setError(null);
		const form = new FormData(e.currentTarget);
		const res = await fetch("/api/subscribe", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				source: QUIZ_SOURCE,
				email: form.get("email"),
				newsletter: form.get("newsletter") === "on",
				website: form.get("website"),
				"cf-turnstile-response": form.get("cf-turnstile-response"),
			}),
		}).catch(() => null);
		if (res?.ok) return setState("sent");
		const body = (await res?.json().catch(() => null)) as { error?: string } | null;
		setError(body?.error ?? "Something went wrong. Please try again.");
		setState("idle");
	}

	if (state === "sent") {
		return (
			<p className="text-foreground flex items-center gap-2 rounded-[10px] bg-white p-4 text-[15px] font-medium">
				<Check className="text-primary size-5" />
				Sent. Check your inbox in a minute.
			</p>
		);
	}
	return (
		<form onSubmit={submit} className="grid gap-3 rounded-[10px] bg-white p-5 md:p-6">
			<h3 className="text-foreground text-[18px] font-semibold tracking-[-0.02em]">{QUIZ_EMAIL_BOX.title}</h3>
			<label htmlFor="quiz-email" className="sr-only">
				Email address
			</label>
			<div className="flex flex-col gap-2.5 sm:flex-row">
				<input
					id="quiz-email"
					name="email"
					type="email"
					required
					autoComplete="email"
					placeholder="Enter your email address"
					className="text-foreground placeholder:text-body focus-visible:border-foreground focus-visible:ring-foreground/10 h-[50px] min-w-0 rounded-full border border-[#e5e5e5] bg-white px-5 text-[15px] outline-none focus-visible:ring-4 sm:flex-1"
				/>
				<button type="submit" disabled={state === "sending"} className={cn(pillDark, "shrink-0 disabled:opacity-60")}>
					{QUIZ_EMAIL_BOX.button}
				</button>
			</div>
			<label className="text-foreground flex items-start gap-2.5 text-sm">
				<input type="checkbox" name="newsletter" className="accent-primary mt-0.5 size-4" />
				<span>{QUIZ_EMAIL_BOX.checkbox}</span>
			</label>
			<input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
			<TurnstileWidget />
			{error && (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			)}
			<p className="text-body text-xs">
				{QUIZ_EMAIL_BOX.smallPrint}{" "}
				<a href="/policies/privacy-policy" className="underline underline-offset-2">
					Privacy Policy
				</a>
			</p>
		</form>
	);
}
