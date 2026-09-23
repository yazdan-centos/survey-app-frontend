import React from "react";
import styled, { keyframes } from "styled-components";

// ── Tokens ──────────────────────────────────────────────────────────────────
const tokens = {
  teal900: "#134e4a",
  teal700: "#0f766e",
  teal500: "#14b8a6",
  teal200: "#99f6e4",
  teal50: "#f0fdfa",
  teal100: "#ccfbf1",
  amber500: "#f59e0b",
  amber100: "#fef3c7",
  amber50: "#fffbeb",
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
  background: ${tokens.teal900};
  padding: 2.5rem 3rem 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -60px;
    left: -60px;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    background: ${tokens.teal500}22;
    pointer-events: none;
  }
`;

const RoleGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const RoleTag = styled.span`
  display: inline-block;
  background: ${({ variant }) =>
    variant === "customer" ? tokens.teal100 : tokens.amber100};
  color: ${({ variant }) =>
    variant === "customer" ? tokens.teal700 : tokens.amber500};
  border-radius: 4px;
  padding: 0.2rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 600;
`;

const Title = styled.h1`
  color: ${tokens.white};
  font-size: clamp(1.3rem, 3vw, 1.9rem);
  font-weight: 700;
  margin: 0 0 0.5rem;
  line-height: 1.35;
`;

const Subtitle = styled.p`
  color: ${tokens.teal200};
  font-size: 0.88rem;
  margin: 0;
  opacity: 0.9;
`;

const Body = styled.main`
  flex: 1;
  max-width: 780px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  animation: ${fadeUp} 0.5s ease both;
`;

const Intro = styled.p`
  font-size: 0.93rem;
  line-height: 1.9;
  color: ${tokens.slate700};
  margin: 0 0 0.9rem;
`;

const CalloutBox = styled.div`
  background: ${tokens.teal50};
  border-right: 4px solid ${tokens.teal500};
  border-radius: 0 8px 8px 0;
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
  font-size: 0.9rem;
  line-height: 1.8;
  color: ${tokens.slate700};
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${tokens.teal700};
  border-right: 3px solid ${tokens.teal500};
  padding-right: 0.75rem;
  margin: 2rem 0 1rem;
`;

const Paragraph = styled.p`
  font-size: 0.9rem;
  line-height: 1.9;
  color: ${tokens.slate700};
  margin: 0 0 0.85rem;
`;

const Dimensions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin: 1rem 0;
`;

const Dim = styled.span`
  background: ${tokens.teal50};
  color: ${tokens.teal700};
  border: 1px solid ${tokens.teal100};
  border-radius: 6px;
  padding: 0.3rem 0.8rem;
  font-size: 0.82rem;
  font-weight: 600;
`;

const NoteBox = styled.div`
  background: ${tokens.amber50};
  border: 1px solid ${tokens.amber100};
  border-radius: 8px;
  padding: 1rem 1.25rem;
  font-size: 0.88rem;
  color: ${tokens.slate700};
  line-height: 1.8;

  strong {
    color: ${tokens.amber500};
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${tokens.slate200};
  margin: 1.75rem 0;
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
export default function StakeholderGuide() {
  return (
    <Wrapper>
      <Header>
        <RoleGroup>
          <RoleTag variant="customer">مشتریان</RoleTag>
          <RoleTag variant="supplier">تامین‌کنندگان</RoleTag>
        </RoleGroup>
        <Title>پیمایش ارزیابی شرکت در کلاس جهانی</Title>
        <Subtitle>معاونت سیستم‌ها و برنامه‌ریزی راهبردی</Subtitle>
      </Header>

      <Body>
        <Intro>
          با توجه به چشم‌انداز شرکت در افق ۱۴۱۰ و هدف‌گذاری برای قرار گرفتن
          در زمره شرکت‌های سرویس‌دهنده حوزه انرژی در کلاس جهانی، ارزیابی
          مستمر وضعیت شرکت از دیدگاه ذی‌نفعان کلیدی و شرکای استراتژیک، می‌تواند
          مبنایی ارزشمند برای شناخت دقیق‌تر جایگاه شرکت، شناسایی نقاط قوت و
          زمینه‌های بهبود باشد.
        </Intro>

        <Intro>
          پرسشنامه پیش‌رو، وضعیت شرکت را در پنج بُعد اصلی مورد ارزیابی قرار
          می‌دهد:
        </Intro>

        <Dimensions>
          {dimensions.map((d) => (
            <Dim key={d}>{d}</Dim>
          ))}
        </Dimensions>

        <CalloutBox>
          از شما دعوت می‌شود به‌عنوان یکی از ذی‌نفعان کلیدی و شرکای استراتژیک
          شرکت، با مشارکت در این پیمایش، دیدگاه و ارزیابی خود را نسبت به وضعیت
          فعلی شرکت در مسیر دستیابی به جایگاه «شرکت در کلاس جهانی» ارائه
          فرمایید.
        </CalloutBox>

        <Divider />

        <SectionTitle>راهنمای ارزیابی</SectionTitle>

        <Paragraph>
          برای هر معیار، چهار سطح عملکرد تعریف شده و مصادیق و نشانه‌های قابل
          مشاهده هر سطح ارائه شده است. مبنای ارزیابی، میزان انطباق عملکرد و
          قابلیت‌های موجود شرکت با این مصادیق است.
        </Paragraph>
        <Paragraph>
          خواهشمند است در هر معیار، پس از مطالعه مصادیق هر چهار سطح، با توجه
          به تجربه، شناخت و برداشت خود از تعامل و همکاری با شرکت، نزدیک‌ترین
          سطح به وضعیت فعلی شرکت را انتخاب فرمایید.
        </Paragraph>
        <Paragraph>
          در ارزیابی، لطفاً وضعیت و عملکرد واقعی و فعلی شرکت را مدنظر قرار
          دهید، نه صرفاً برنامه‌ها یا اهداف آتی. همچنین خواهشمند است ارزیابی
          خود را بر اساس مجموع تجربه و تعامل با شرکت انجام دهید و از تعمیم یک
          تجربه موردی خودداری فرمایید.
        </Paragraph>

        <NoteBox>
          <strong>نکته:</strong> در مواردی که به دلیل ماهیت یک معیار یا محدود
          بودن اطلاعات، امکان ارزیابی وجود ندارد، گزینه «اطلاعات کافی برای
          ارزیابی ندارم» قابل انتخاب است. در چنین مواردی، از ارائه پاسخ
          مبتنی بر حدس و گمان خودداری فرمایید.
        </NoteBox>

        <Divider />

        <Paragraph style={{ textAlign: "center", color: tokens.slate500 }}>
          از مشارکت و دیدگاه ارزشمند شما سپاسگزاریم.
        </Paragraph>
      </Body>

      <Footer>معاونت سیستم‌ها و برنامه‌ریزی راهبردی</Footer>
    </Wrapper>
  );
}
