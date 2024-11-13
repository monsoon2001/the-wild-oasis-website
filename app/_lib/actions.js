"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  // Retrieve and trim the nationalId value
  const nationalId = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  // Check if nationalId is valid (alphanumeric, 6-12 characters)
  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalId)) {
    throw new Error("Please provide a valid national ID");
  }

  const updateData = { nationality, countryFlag, nationalId };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) throw new Error("Guest could not be updated");

  revalidatePath("/account/profile");
}

export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  // Object.entries(formData.entries())

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 100),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { error } = await supabase.from("bookings").insert([newBooking]);

  if (error) throw new Error("Booking could not be created");

  revalidatePath(`/cabins/${bookingData.cabinId}`);

  redirect("/cabins/thankyou");
}

export async function deleteBooking(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  // delete the booking only if it exists in the guest's bookings
  if (!guestBookingsIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking.");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  // formdata stores everything in a string so need to convert to number
  const bookingId = Number(formData.get("bookingId"));
  // 1. authentication
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  // 2. authorization
  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  // delete the booking only if it exists in the guest's bookings
  if (!guestBookingsIds.includes(bookingId))
    throw new Error("You are not allowed to update this booking.");

  //3. building update data
  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  //4. mutation
  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  //5. error handling
  if (error) throw new Error("Booking could not be updated");

  //6. revalidation
  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/edit/${bookingId}`);

  //7. redirecting
  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}