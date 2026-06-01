export class Vehicle {
    vehicleID: number;
    make: string | null;
    model: string | null;
    year: number | null;
    trim: string | null;
    price: number;
    color: string | null;
    inStock: boolean;
    vin: string;
    transmission: string;

    constructor(
        make: string | null = null,
        model: string | null = null,
        year: number | null = null,
        trim: string | null = null,
        price: number = 0,
        color: string | null = null,
        inStock: boolean = false,
        vin: string = "N/A",
        transmission: string = "Automatic"
    ) {
        this.vehicleID = 0;
        this.make = make;
        this.model = model;
        this.year = year;
        this.trim = trim;
        this.price = price;
        this.color = color;
        this.inStock = inStock;
        this.vin = vin;
        this.transmission = transmission || "Automatic";
    }

    getFullDescription(): string {
        if (!this.make && !this.model) {
            return "No Vehicle Details";
        }

        const displayYear = this.year || "";
        const displayMake = this.make || "";
        const displayModel = this.model || "";
        const displayTrim = this.trim ? ` (${this.trim})` : "";

        return `${displayYear} ${displayMake} ${displayModel}${displayTrim}`.trim();
    }

    toString(): string {
        return this.getFullDescription();
    }
}