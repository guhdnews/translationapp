import Link from "next/link";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer__links">
                <Link href="/about">About</Link>
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
            </div>
            <p className="footer__copyright">
                © {currentYear} Translate Voice Notes. All rights reserved.
            </p>
        </footer>
    );
}
