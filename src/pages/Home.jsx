// src/pages/Home.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import Services from '../sections/Services';
import Portfolio from '../sections/Portfolio';
import TechStack from '../sections/TechStack';
import Methodology from '../sections/Methodology';
import Achievements from '../sections/Achievements';
import Testimonials from '../sections/Testimonials';
import Blog from '../sections/Blog';
import Contact from '../sections/Contact';

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <TechStack />
        <Methodology />
        <Achievements />
        <Testimonials />
        <Blog />
        <Contact />
      </main>
    </>
  );
};

export default Home;
