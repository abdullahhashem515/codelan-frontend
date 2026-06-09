// src/pages/Home.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // إذا كنت قد أنشأته
import Hero from '../sections/Hero';
import Services from '../sections/Services';
import Portfolio from '../sections/Portfolio';
import TechStack from '../sections/TechStack';
import Methodology from '../sections/Methodology';
import Achievements from '../sections/Achievements';
import Testimonials from '../sections/Testimonials';
import Blog from '../sections/Blog';
import Contact from '../sections/Contact';

const Home = ({ lang, setLang }) => {
  return (
    <>
      <Navbar lang={lang} setLang={setLang} />
      <main>
        <Hero lang={lang} />
        <Services lang={lang} />
        <Portfolio lang={lang} />
        <TechStack lang={lang} />
        <Methodology lang={lang} />
        <Achievements lang={lang} />
        <Testimonials lang={lang} />
        <Blog lang={lang} />
        <Contact lang={lang} />
      </main>
      {/* <Footer lang={lang} /> يمكنك تفعيله إذا كان موجوداً */}
    </>
  );
};

export default Home;