import React from 'react';
import Icon from './Icon';

export default function Header({ category, hasGames, onRandomGame, children }) {
  return (
    <>
      <header className="topbar">
        <div className="breadcrumb">
          Mitt bibliotek <Icon name="chevron" size={13} />
          <span>{category}</span>
        </div>
        <span className="demo-label">
          <span /> Förhandsversion
        </span>
      </header>
      <div className="workspace-inner">
        <section className="page-heading">
          <div>
            <p className="eyebrow">SAMLINGEN, PÅ ETT STÄLLE</p>
            <h1>
              {category === 'Alla spel'
                ? 'Nästa spelkväll börjar här.'
                : category}
            </h1>
            <p className="intro">
              Bläddra, upptäck och hitta något att samlas kring.
            </p>
          </div>
          <button
            className="random-button"
            disabled={!hasGames}
            onClick={onRandomGame}
          >
            <Icon name="dice" size={18} />
            Välj åt mig
            <Icon name="arrow" size={17} />
          </button>
        </section>
        {children}
      </div>
    </>
  );
}
