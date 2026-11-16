
import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const Section = ({
  title,
  description,
  children,
}: SectionProps) => {
  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>

      {children}
    </section>
  );
};

export default Section;
