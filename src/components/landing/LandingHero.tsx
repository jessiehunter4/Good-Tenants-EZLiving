import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BedDouble, MapPin, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroScene from "@/assets/landing/hero.svg";

/**
 * The hero, and the only search on the page.
 *
 * The search does not pretend to be a search: there is no rental inventory in
 * this database yet, so it carries what someone typed into registration rather
 * than dropping them on an empty results page.
 */
export const LandingHero = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [beds, setBeds] = useState("");
  const [budget, setBudget] = useState("");

  const start = () => {
    const params = new URLSearchParams({ role: "tenant" });
    if (city) params.set("city", city);
    navigate(`/register?${params.toString()}`);
  };

  return (
    <section className="bg-sand">
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-espresso sm:text-5xl lg:text-6xl">
              Find your next
              <br />
              rental home
            </h1>
            <p className="mt-6 max-w-md text-lg font-medium text-espresso-muted">
              Prove you qualify once, then reuse it everywhere. No repeating your income to
              every agent who asks.
            </p>
            <Button
              size="lg"
              onClick={start}
              className="mt-8 bg-espresso px-8 text-sand hover:bg-espresso/90"
            >
              Get started
            </Button>
          </div>

          <div className="relative">
            <img
              src={heroScene}
              alt=""
              aria-hidden="true"
              className="w-full rounded-2xl"
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* Overlaps the section boundary, as the reference does. */}
      <div className="mx-auto -mb-16 max-w-5xl translate-y-16 px-4 sm:px-6">
        <div className="grid gap-3 rounded-2xl bg-clay p-4 shadow-lg sm:p-5 md:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="relative">
            <span className="sr-only">Location</span>
            <MapPin
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-muted"
              aria-hidden="true"
            />
            <Input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Location"
              className="h-12 border-0 bg-sand pl-9 text-espresso placeholder:text-espresso-muted"
            />
          </label>

          <label className="relative">
            <span className="sr-only">Bedrooms</span>
            <BedDouble
              className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-espresso-muted"
              aria-hidden="true"
            />
            <Select value={beds} onValueChange={setBeds}>
              <SelectTrigger className="h-12 border-0 bg-sand pl-9 text-espresso">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                {["Studio", "1", "2", "3", "4+"].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="relative">
            <span className="sr-only">Maximum rent</span>
            <Wallet
              className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-espresso-muted"
              aria-hidden="true"
            />
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger className="h-12 border-0 bg-sand pl-9 text-espresso">
                <SelectValue placeholder="Max rent" />
              </SelectTrigger>
              <SelectContent>
                {["$2,000", "$3,000", "$4,000", "$5,000", "$6,000+"].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <Button
            onClick={start}
            className="h-12 bg-espresso px-8 text-sand hover:bg-espresso/90"
          >
            Start
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
