"use client";

import { useRouter } from "next/navigation";

export default function BackToSearchLink() {
  const router = useRouter();

  function goBack(event) {
    event.preventDefault();

    const savedHomeUrl = window.sessionStorage.getItem(
      "bestdaam-home-url"
    );

    if (savedHomeUrl && savedHomeUrl.startsWith("/")) {
      router.push(savedHomeUrl);
      return;
    }

    router.push("/");
  }

  return (
    <a href="/" className="back-link" onClick={goBack}>
      ← Back to results
    </a>
  );
}
