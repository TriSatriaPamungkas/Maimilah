"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useEventStore } from "@/src/store/useEventStore";
import EventDetail from "@/src/components/organism/eventDetail";

const EventDetailPage = () => {
  const { id } = useParams();
  const { getEventById, selectEvent } = useEventStore();

  useEffect(() => {
    if (id) {
      const eventData = getEventById(id as string);
      if (eventData) selectEvent(eventData);
    }
  }, [id, selectEvent, getEventById]);

  return <EventDetail />;
};

export default EventDetailPage;
