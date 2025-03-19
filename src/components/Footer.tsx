import React from "react";
import { Shield } from "lucide-react";

const Footer: React.FC = () => {
      const year = new Date().getFullYear();

      return (
            <footer className="w-full py-6 px-4 border-t border-border mt-auto">
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                              <Shield className="w-5 h-5 text-primary" />
                              <span className="text-sm font-medium">
                                    Deep Fake Detection
                              </span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                              &copy; {year} DFD. All rights reserved.
                        </div>

                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                              <FooterLink href="#">Privacy</FooterLink>
                              <FooterLink href="#">Terms</FooterLink>
                              <FooterLink href="#">About</FooterLink>
                        </div>
                  </div>
            </footer>
      );
};

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({
      href,
      children,
}) => (
      <a
            href={href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
            {children}
      </a>
);

export default Footer;
