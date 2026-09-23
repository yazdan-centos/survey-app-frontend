import React from "react";
import styled, { keyframes } from "styled-components";

// ── Tokens ──────────────────────────────────────────────────────────────────
const tokens = {
  indigo900: "#1e1b4b",
  indigo700: "#3730a3",
  indigo500: "#6366f1",
  indigo100: "#e0e7ff",
  indigo50: "#eef2ff",
  gold500: "#d97706",
  gold200: "#fde68a",
  gold50: "#fffbeb",
  slate700: "#334155",
  slate500: "#64748b",
  slate200: "#e2e8f0",
  white: "#ffffff",
};

// ── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Styled Components ─────────────────────────────────────────────────────────
const Wrapper = styled.div`
  direction: rtl;
  font-family: "Vazirmatn", "IRANSans", Tahoma, sans-serif;
  background: ${tokens.white};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: ${tokens.indigo900};
  padding: 2.5rem 3rem 2rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, ${tokens.indigo500}33 0%, transparent 70%);
    transform: translate(30%, 50%);
    pointer-events: none;
  }
`;

const Tag = styled.span`
  display: inline-block;
  background: ${tokens.gold50};
  color: ${tokens.gold500};
  border: 1px solid ${tokens.gold200};
  border-radius: 4px;
  padding: 0.2rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  color: ${tokens.white};
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 700;
  margin: 0 0 0.5rem;
  line-height: 1.3;
`;

const Subtitle = styled.p`
  color: ${tokens.indigo100};
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.85;
`;

const Body = styled.main`
  flex: 1;
  max-width: 780px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  animation: ${fadeUp} 0.5s ease both;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${tokens.indigo700};
  border-right: 3px solid ${tokens.indigo500};
  padding-right: 0.75rem;
  margin: 0 0 1rem;
`;

const Paragraph = styled.p`
  font-size: 0.92rem;
  line-height: 1.9;
  color: ${tokens.slate700};
  margin: 0 0 0.9rem;
`;

const Dimensions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 1rem 0;
`;

const Dim = styled.span`
  background: ${tokens.indigo50};
  color: ${tokens.indigo700};
  border: 1px solid ${tokens.indigo100};
  border-radius: 6px;
  padding: 0.3rem 0.8rem;
  font-size: 0.82rem;
  font-weight: 600;
`;

const InfoBox = styled.div`
  background: ${tokens.gold50};
  border: 1px solid ${tokens.gold200};
  border-radius: 8px;
  padding: 1rem 1.25rem;
  font-size: 0.88rem;
  color: ${tokens.slate700};
  line-height: 1.8;

  strong {
    color: ${tokens.gold500};
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${tokens.slate200};
  margin: 2rem 0;
`;

const Footer = styled.footer`
  text-align: center;
  font-size: 0.8rem;
  color: ${tokens.slate500};
  padding: 1.5rem 2rem;
  border-top: 1px solid ${tokens.slate200};
`;

// ── Data ─────────────────────────────────────────────────────────────────────
const dimensions = [
  "تمرکز بر مشتری",
  "منابع و قابلیت‌ها",
  "چشم‌انداز استراتژیک",
  "ارزش‌آفرینی",
  "تمرکز بر کیفیت",
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function BoardGuide() {
  return (
    <Wrapper>
      <Header>
        <Tag>هیأت مدیره</Tag>
        <Title>پیمایش ارزیابی شرکت در کلاس جهانی</Title>
        <Subtitle>معاونت سیستم‌ها و برنامه‌ریزی راهبردی</Subtitle>
      </Header>

      <Body>
        <Section>
          <Paragraph>
            اعضای محترم هیأت‌مدیره،
          </Paragraph>
          <Paragraph>
            با توجه به چشم‌انداز شرکت در افق ۱۴۱۰ و هدف‌گذاری برای قرار گرفتن در
            زمره شرکت‌های سرویس‌دهنده حوزه انرژی در کلاس جهانی، ارزیابی مستمر
            وضعیت شرکت در برابر ویژگی‌ها و الزامات چنین سازمان‌هایی، می‌تواند
            مبنایی برای شناخت دقیق‌تر جایگاه شرکت و جهت‌دهی به اقدامات و
            تصمیمات آتی باشد.
          </Paragraph>
          <Paragraph>
            پرسشنامه پیش‌رو، وضعیت شرکت را در پنج بُعد اصلی مورد ارزیابی قرار
            می‌دهد:
          </Paragraph>
          <Dimensions>
            {dimensions.map((d) => (
              <Dim key={d}>{d}</Dim>
            ))}
          </Dimensions>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>راهنمای ارزیابی</SectionTitle>
          <Paragraph>
            برای هر معیار، چهار سطح عملکرد تعریف شده و مصادیق و نشانه‌های قابل
            مشاهده هر سطح ارائه شده است. مبنای ارزیابی، میزان انطباق عملکرد و
            قابلیت‌های موجود شرکت با این مصادیق است.
          </Paragraph>
          <Paragraph>
            خواهشمند است در هر معیار، با توجه به شناخت، تجربه و اشراف خود نسبت
            به عملکرد و وضعیت کلی شرکت، پس از مطالعه مصادیق هر چهار سطح،
            نزدیک‌ترین سطح به وضعیت فعلی شرکت را انتخاب فرمایید.
          </Paragraph>
          <Paragraph>
            برای انعکاس دقیق‌تر وضعیت واقعی شرکت، مناسب است شرکت به‌عنوان یک
            مجموعه یکپارچه و در کلیت عملکرد آن مورد توجه قرار گیرد تا قضاوت
            صرفاً بر مبنای تجربه‌های موردی یا رویدادهای مقطعی شکل نگیرد.
          </Paragraph>
          <Paragraph>
            همچنین در این ارزیابی، وضعیت موجود و عملکرد واقعی شرکت مدنظر است؛
            نه صرفاً برنامه‌ها، اهداف یا وضعیت مطلوبی که برای آینده پیش‌بینی
            شده است.
          </Paragraph>
        </Section>

        <InfoBox>
          <strong>نکته:</strong> در مواردی که به دلیل ماهیت یک معیار یا محدود
          بودن اطلاعات و شواهد در دسترس، امکان ارزیابی وجود ندارد، گزینه
          «اطلاعات کافی برای ارزیابی ندارم» قابل انتخاب است.
        </InfoBox>

        <Divider />

        <Paragraph style={{ textAlign: "center", color: tokens.slate500 }}>
          از مشارکت و دیدگاه ارزشمند شما سپاسگزاریم.
        </Paragraph>
      </Body>

      <Footer>معاونت سیستم‌ها و برنامه‌ریزی راهبردی</Footer>
    </Wrapper>
  );
}
