"use client"

interface Link {
  text: string
  url: string
}

interface SocialMedia {
  platform: string
  url: string
}

interface FooterProps {
  links: Link[]
  socialMedia: SocialMedia[]
  copyrightText: string
}

export function Footer({ links, socialMedia, copyrightText }: FooterProps) {
  return (
    <footer className="bg-muted py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Links */}
          <div>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <div className="flex gap-4 justify-start md:justify-end">
              {socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground border-t border-border pt-8">
          {copyrightText}
        </div>
      </div>
    </footer>
  )
}