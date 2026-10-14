"use client";

import createGlobe, { type Globe } from "cobe";
import { useEffect, useRef } from "react";
import type { LiveMarker } from "@/server/queries/analytics";

// Dotted WebGL globe (cobe) like Shopify's Live View: visitors right now and
// today's orders as markers. It turns slowly on its own; drag to spin it.

const VISITOR: [number, number, number] = [0.31, 0.44, 0.35]; // brand sage #4F6F5A
const ORDER: [number, number, number] = [0.42, 0.3, 0.95]; // pre-order purple #6c4cf1

/** cobe's angles for putting (lat, lng) in front of the camera. */
const anglesFor = (lat: number, lng: number): [number, number] => [Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];

const START = anglesFor(38, -97); // the continental US

const toCobe = (markers: LiveMarker[]) =>
	markers.map((m) => ({
		location: [m.lat, m.lng] as [number, number],
		size: m.kind === "order" ? 0.07 : 0.05,
		color: m.kind === "order" ? ORDER : VISITOR,
	}));

export function LiveGlobe({ markers, decorative = false }: { markers: LiveMarker[]; /** Background use: no dragging, hidden from screen readers. */ decorative?: boolean }) {
	// cobe wraps its canvas in a div of its own, so React only owns an empty
	// host and the canvas is created by hand inside it.
	const host = useRef<HTMLDivElement>(null);
	const globe = useRef<Globe | null>(null);
	const drag = useRef<{ x: number; phi: number } | null>(null);
	const phi = useRef(START[0]);
	const latest = useRef(markers);

	// The markers change on every poll; push them into the running globe.
	useEffect(() => {
		latest.current = markers;
		globe.current?.update({ markers: toCobe(markers) });
	}, [markers]);

	useEffect(() => {
		const box = host.current;
		if (!box) return;
		const el = document.createElement("canvas");
		el.style.cssText = "width:100%;height:100%;display:block";
		box.append(el);
		const dark = document.documentElement.classList.contains("dark");
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		let width = el.offsetWidth;

		const g = createGlobe(el, {
			devicePixelRatio: dpr,
			width: width * dpr,
			height: width * dpr,
			phi: phi.current,
			theta: START[1] * 0.6,
			dark: dark ? 1 : 0,
			diffuse: 1.2,
			mapSamples: 20000,
			mapBrightness: dark ? 5 : 1.05,
			mapBaseBrightness: 0,
			baseColor: dark ? [0.36, 0.5, 0.42] : [0.78, 0.9, 0.84],
			markerColor: VISITOR,
			glowColor: dark ? [0.14, 0.2, 0.17] : [0.8, 0.9, 0.85],
			markers: toCobe(latest.current),
		});
		globe.current = g;

		let frame = 0;
		const tick = () => {
			if (!drag.current) phi.current += 0.0018;
			g.update({ phi: phi.current, width: width * dpr, height: width * dpr });
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);

		const resize = new ResizeObserver(() => {
			width = el.offsetWidth;
		});
		resize.observe(el);

		// Fade in once WebGL has drawn the first frame.
		const show = setTimeout(() => (box.style.opacity = "1"), 50);

		return () => {
			cancelAnimationFrame(frame);
			clearTimeout(show);
			resize.disconnect();
			g.destroy();
			globe.current = null;
			box.replaceChildren();
		};
	}, []);

	if (decorative) {
		return <div ref={host} aria-hidden className="pointer-events-none aspect-square w-full opacity-0 transition-opacity duration-700" />;
	}
	return (
		<div
			ref={host}
			role="img"
			aria-label="Globe with visitors right now and today's orders"
			className="aspect-square w-full cursor-grab opacity-0 transition-opacity duration-700 active:cursor-grabbing"
			onPointerDown={(e) => {
				drag.current = { x: e.clientX, phi: phi.current };
				e.currentTarget.setPointerCapture(e.pointerId);
			}}
			onPointerMove={(e) => {
				if (drag.current) phi.current = drag.current.phi + (e.clientX - drag.current.x) / 200;
			}}
			onPointerUp={() => (drag.current = null)}
			onPointerCancel={() => (drag.current = null)}
		/>
	);
}
